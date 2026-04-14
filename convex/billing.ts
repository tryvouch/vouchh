import { mutation, query, internalMutation, httpAction } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";
import { internal } from "./_generated/api";

const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * INTERNAL mutation — only callable from webhook handlers, NOT from the client.
 * Syncs subscription state from RevenueCat webhook events.
 */
export const syncSubscriptionIdempotent = internalMutation({
    args: {
        webhookId: v.string(),
        eventType: v.string(),
        clerkId: v.string(),
        revenueCatId: v.string(),
        status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due"), v.literal("trialing"), v.literal("hibernating")),
        currentPeriodEnd: v.number(),
        trialEndsAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Idempotency Check
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();
        
        if (existing) {
            console.log(`Webhook ${args.webhookId} already processed.`);
            return { success: true, idempotent: true };
        }

        // 2. Record Webhook
        await ctx.db.insert("processed_webhooks", {
            webhookId: args.webhookId,
            type: args.eventType,
            processedAt: Date.now(),
        });

        // 3. Process Subscription Logic
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) throw new Error("User not found");

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        const isSubscriptionActive = 
            args.status === "active" || 
            (args.status === "trialing" && (args.trialEndsAt ?? 0) > Date.now());

        const updateData: {
            dodoId: string;
            status: "active" | "cancelled" | "past_due" | "trialing" | "hibernating";
            currentPeriodEnd: number;
            isSubscriptionActive: boolean;
            trialEndsAt?: number;
        } = {
            dodoId: args.revenueCatId, // Reusing field for RevenueCat ID
            status: args.status,
            currentPeriodEnd: args.currentPeriodEnd,
            isSubscriptionActive,
        };
        
        if (args.trialEndsAt !== undefined) {
            updateData.trialEndsAt = args.trialEndsAt;
        }

        if (subscription) {
            await ctx.db.patch(subscription._id, updateData);
        } else {
            await ctx.db.insert("subscriptions", {
                userId: user._id,
                ...updateData,
            });
        }

        // Update User Plan
        const plan = isSubscriptionActive ? "pro" : "free";
        await ctx.db.patch(user._id, { plan });

        return { success: true, idempotent: false };
    },
});

/**
 * INTERNAL mutation — prevents external callers from downgrading users.
 */
export const handlePaymentFailed = internalMutation({
    args: {
        webhookId: v.string(),
        clerkId: v.string(),
        revenueCatId: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();

        if (existing) {
            return { success: true, idempotent: true };
        }

        await ctx.db.insert("processed_webhooks", {
            webhookId: args.webhookId,
            type: "payment.failed",
            processedAt: Date.now(),
        });

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) {
            return { success: false };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        if (subscription) {
            await ctx.db.patch(subscription._id, {
                status: "past_due",
                isSubscriptionActive: false,
                dodoId: args.revenueCatId,
            });
            await ctx.db.patch(user._id, { plan: "free" });

            await ctx.runMutation(internal.dunning.reportPaymentFailure, {
                userId: user._id,
                subscriptionId: subscription._id,
                email: user.email,
            });
        }

        return { success: true, idempotent: false };
    },
});

/**
 * RevenueCat Webhook HTTP Action
 * Called from the Next.js API route after Authorization header verification.
 */
export const processRevenueCatWebhook = httpAction(async (ctx, request) => {
    const requestJson = await request.json();
    
    // Handle both Next.js proxied payload and direct RevenueCat webhook payload
    let payload = requestJson;
    if (requestJson.event) {
        payload = {
            type: requestJson.event.type,
            appUserId: requestJson.event.app_user_id,
            productId: requestJson.event.product_id,
            expirationAtMs: requestJson.event.expiration_at_ms,
            transactionId: requestJson.event.transaction_id || requestJson.event.id,
            environment: requestJson.event.environment,
            periodType: requestJson.event.period_type,
        };
    }

    const { type, appUserId, expirationAtMs, transactionId } = payload;

    if (!type || !appUserId) {
        return new Response("Invalid payload", { status: 400 });
    }

    const webhookId = transactionId || `rc_${Date.now()}`;

    // Map RevenueCat event types to subscription status
    const statusMap: Record<string, "active" | "cancelled" | "past_due" | "trialing"> = {
        INITIAL_PURCHASE: "active",
        RENEWAL: "active",
        TRIAL_STARTED: "trialing",
        TRIAL_CONVERTED: "active",
        CANCELLATION: "cancelled",
        UNCANCELLATION: "active",
        EXPIRATION: "cancelled",
        BILLING_ISSUE: "past_due",
        PRODUCT_CHANGE: "active",
    };

    const status = statusMap[type];
    if (!status) {
        // Event type we don't care about (e.g., TEST, TRANSFER)
        return new Response("Ignored", { status: 200 });
    }

    if (type === "BILLING_ISSUE") {
        await ctx.runMutation(internal.billing.handlePaymentFailed, {
            webhookId,
            clerkId: appUserId,
            revenueCatId: appUserId,
        });
        return new Response("Processed", { status: 200 });
    }

    const currentPeriodEnd = expirationAtMs || (Date.now() + 30 * 24 * 60 * 60 * 1000);

    await ctx.runMutation(internal.billing.syncSubscriptionIdempotent, {
        webhookId,
        eventType: type,
        clerkId: appUserId,
        revenueCatId: appUserId,
        status,
        currentPeriodEnd,
        trialEndsAt: type === "TRIAL_STARTED" ? currentPeriodEnd : undefined,
    });

    return new Response("Processed", { status: 200 });
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
            isSubscriptionActive: false,
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
            plan: "pro",
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
            isSubscriptionActive: true,
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

/**
 * Client-callable mutation to sync subscription after successful RevenueCat purchase.
 * Requires authentication — only syncs the calling user's own subscription.
 */
export const syncSubscriptionFromClient = mutation({
    args: {
        status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("trialing")),
        currentPeriodEnd: v.number(),
        revenueCatId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        const isSubscriptionActive = args.status === "active" || args.status === "trialing";

        if (subscription) {
            await ctx.db.patch(subscription._id, {
                dodoId: args.revenueCatId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                isSubscriptionActive,
            });
        } else {
            await ctx.db.insert("subscriptions", {
                userId,
                dodoId: args.revenueCatId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                isSubscriptionActive,
            });
        }

        const plan = isSubscriptionActive ? "pro" : "free";
        const user = await ctx.db.get(userId);
        if (user) {
            await ctx.db.patch(userId, { plan });
        }

        return { success: true };
    },
});

export const syncSubscription = internalMutation({
    args: {
        clerkId: v.string(),
        revenueCatId: v.string(),
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
            const isSubscriptionActive = 
                args.status === "active" || 
                (args.status === "trialing" && (args.trialEndsAt ?? 0) > Date.now());

            const updateData: {
                dodoId: string;
                status: "active" | "cancelled" | "past_due" | "trialing" | "hibernating";
                currentPeriodEnd: number;
                isSubscriptionActive: boolean;
                trialEndsAt?: number;
            } = {
                dodoId: args.revenueCatId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                isSubscriptionActive,
            };
            
            if (args.trialEndsAt !== undefined) {
                updateData.trialEndsAt = args.trialEndsAt;
            }

            await ctx.db.patch(subscription._id, updateData);

            if (args.status === "active") {
                await ctx.db.patch(user._id, { plan: "pro" });
            } else if (args.status === "cancelled") {
                await ctx.db.patch(user._id, { plan: "free" });
            }
        }
    },
});

export const checkTrialExpiration = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId);

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
