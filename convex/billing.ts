import { mutation, query, internalMutation, httpAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";
import { internal } from "./_generated/api";

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ... (initUser remains same)

export const processDodoWebhook = httpAction(async (ctx, request) => {
    const signature = request.headers.get("webhook-id"); // Using webhook-id for idempotency tracking
    if (!signature) {
        return new Response("Missing webhook-id", { status: 400 });
    }

    // Idempotency Check
    const isProcessed = await ctx.runQuery(internal.billing.isWebhookProcessed, { webhookId: signature });
    if (isProcessed) {
        return new Response("Webhook already processed", { status: 200 });
    }

    const payload = await request.json();
    const { type, data } = payload;

    // Record Webhook (Idempotency) & Process
    await ctx.runMutation(internal.billing.recordAndProcessWebhook, {
        webhookId: signature,
        type,
        data,
    });

    return new Response("Webhook processed", { status: 200 });
});

export const isWebhookProcessed = internalQuery({
    args: { webhookId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();
        return !!existing;
    },
});

export const recordAndProcessWebhook = internalMutation({
    args: {
        webhookId: v.string(),
        type: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        // 1. Record Webhook
        await ctx.db.insert("processed_webhooks", {
            webhookId: args.webhookId,
            type: args.type,
            processedAt: Date.now(),
        });

        // 2. Process Logic
        const { type, data } = args;
        const clerkId = data.metadata?.clerk_id || data.customer_id;

        if (!clerkId) {
            console.error("No clerk_id in webhook payload");
            return;
        }

        const statusMap: Record<string, "active" | "cancelled" | "past_due" | "trialing"> = {
            active: "active",
            trialing: "trialing",
            canceled: "cancelled",
            past_due: "past_due",
        };

        // Reuse syncSubscription logic (or call it directly if exported as internal helper, but here we inline for safety/atomicity)
         const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (!user) return; // User not found, maybe log error

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();
        
        // Logic to update subscription based on event type
        // ... (Simplified for brevity, assuming syncSubscription logic handles the core update)
        // We will call the existing syncSubscription internal mutation to keep logic DRY if possible, 
        // or just implement the update here. Given the context, I'll implement the update here to ensure it runs within the same transaction.

        let status = statusMap[data.status] || "active";
        let currentPeriodEnd = new Date(data.current_period_end).getTime();
        let trialEndsAt = data.trial_end ? new Date(data.trial_end).getTime() : undefined;

        if (type === "subscription.cancelled" || type === "subscription.deleted") {
            status = "cancelled";
            currentPeriodEnd = Date.now();
        }

        if (subscription) {
            const isSubscriptionActive = 
                status === "active" || 
                (status === "trialing" && trialEndsAt && trialEndsAt > Date.now());

            await ctx.db.patch(subscription._id, {
                dodoId: data.id,
                status,
                currentPeriodEnd,
                trialEndsAt,
                isSubscriptionActive,
            });
        } else {
            // Create new if somehow missing
             await ctx.db.insert("subscriptions", {
                userId: user._id,
                dodoId: data.id,
                status,
                currentPeriodEnd,
                trialEndsAt,
                isSubscriptionActive: status === "active",
            });
        }
    },
});

export const hibernateSubscription = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        if (!subscription) throw new Error("No subscription found");

        // Lock data instead of deleting
        await ctx.db.patch(subscription._id, {
            status: "hibernating",
            isSubscriptionActive: false, // Access restricted but data preserved
        });

        return { success: true, message: "Account hibernated. Data locked." };
    },
});

export const initUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            return existingUser._id;
        }

        // Create new user with Pro plan (trial period)
        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: identity.email!,
            plan: "pro", // Start as Pro during trial
            createdAt: Date.now(),
        });

        // Create trial subscription
        const trialEnd = Date.now() + TRIAL_DURATION_MS;
        await ctx.db.insert("subscriptions", {
            userId,
            dodoId: "",
            status: "trialing",
            currentPeriodEnd: trialEnd,
            trialEndsAt: trialEnd,
            isSubscriptionActive: true, // Trial grants active access
        });

        return userId;
    },
});

export const getSubscription = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();
    },
});

export const syncSubscription = internalMutation({
    args: {
        clerkId: v.string(),
        dodoPaymentId: v.string(), // Keep for backward compatibility
        status: v.union(
            v.literal("active"),
            v.literal("cancelled"),
            v.literal("past_due"),
            v.literal("trialing"),
            v.literal("hibernating")
        ),
        currentPeriodEnd: v.number(),
        trialEndsAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        if (subscription) {
            // Compute isSubscriptionActive
            const isSubscriptionActive = 
                args.status === "active" || 
                (args.status === "trialing" && args.trialEndsAt && args.trialEndsAt > Date.now());

            const updateData: any = {
                dodoId: args.dodoPaymentId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                isSubscriptionActive,
            };
            
            if (args.trialEndsAt !== undefined) {
                updateData.trialEndsAt = args.trialEndsAt;
            }

            await ctx.db.patch(subscription._id, updateData);

            // Upgrade user to Pro if subscription is active
            if (args.status === "active") {
                await ctx.db.patch(user._id, { plan: "pro" });
            } else if (args.status === "cancelled") {
                await ctx.db.patch(user._id, { plan: "free" });
            }
        }
    },
});

export const hibernateSubscription = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .unique();

        if (!subscription) {
            throw new Error("Subscription not found");
        }

        // Logic: Switch to hibernation plan ($5/mo)
        // In a real integration, this would call Dodo API to switch the plan.
        // Here we update the local state.
        
        await ctx.db.patch(subscription._id, {
            status: "hibernating",
            isSubscriptionActive: false, // Data locked
        });

        // We should also ensure data is not deleted.
        return { success: true, message: "Plan hibernated. Data is safe." };
    },
});

export const checkTrialExpiration = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) return null;

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        if (!subscription) return null;

        // Check if trial has expired
        if (
            subscription.status === "trialing" &&
            subscription.trialEndsAt &&
            subscription.trialEndsAt < Date.now()
        ) {
            // Downgrade to free
            await ctx.db.patch(subscription._id, { 
                status: "cancelled",
                isSubscriptionActive: false
            });
            await ctx.db.patch(user._id, { plan: "free" });
            return { expired: true };
        }

        return { expired: false, trialEndsAt: subscription.trialEndsAt };
    },
});
