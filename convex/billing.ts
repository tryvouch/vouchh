import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const initUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            return existingUser._id;
        }

        // Create new user with Pro plan (trial period)
        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
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
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const syncSubscription = mutation({
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
