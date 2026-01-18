import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MAX_FREE_REVIEWS } from "./helpers";

export const createWidget = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        sourceType: v.union(v.literal("google"), v.literal("yelp"), v.literal("manual")),
        sourceId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("widgets", {
            userId: args.userId,
            name: args.name,
            sourceType: args.sourceType,
            sourceId: args.sourceId,
            settings: {},
            createdAt: Date.now(),
        });
    },
});

export const getWidgets = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("widgets")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const getVisibleReviews = query({
    args: {
        widgetId: v.id("widgets"),
        userPlan: v.union(v.literal("free"), v.literal("pro")),
        isTrialActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", args.widgetId))
            .filter((q) => q.eq(q.field("isVisible"), true))
            .order("desc")
            .collect();

        // If user is on free plan and trial is not active, limit to 3 reviews
        if (args.userPlan === "free" && !args.isTrialActive) {
            return reviews.slice(0, MAX_FREE_REVIEWS);
        }

        return reviews;
    },
});
