import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MAX_FREE_REVIEWS } from "./helpers";
import { getAuthUserId } from "./auth";

export const createWidget = mutation({
    args: {
        name: v.string(),
        sourceType: v.union(v.literal("google"), v.literal("yelp"), v.literal("manual")),
        sourceId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        
        return await ctx.db.insert("widgets", {
            userId,
            name: args.name,
            sourceType: args.sourceType,
            sourceId: args.sourceId,
            settings: {},
            createdAt: Date.now(),
        });
    },
});

export const getWidgets = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);

        return await ctx.db
            .query("widgets")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const getVisibleReviews = query({
    args: {
        widgetId: v.id("widgets"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const widget = await ctx.db.get(args.widgetId);
        if (!widget || widget.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        const isTrialActive = !!(
            subscription?.status === "trialing" &&
            subscription.trialEndsAt &&
            subscription.trialEndsAt > Date.now()
        );
        const isPro = subscription?.status === "active";

        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", args.widgetId))
            .filter((q) => q.eq(q.field("isVisible"), true))
            .order("desc")
            .collect();

        // If user is on free plan and trial is not active, limit to 3 reviews
        if (!isPro && !isTrialActive) {
            return reviews.slice(0, MAX_FREE_REVIEWS);
        }

        return reviews;
    },
});
