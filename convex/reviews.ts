import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

export const getById = internalQuery({
    args: { id: v.id("reviews") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByWidget = query({
    args: { widgetId: v.id("widgets") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const widget = await ctx.db.get(args.widgetId);
        if (!widget || widget.userId !== userId) {
            throw new Error("Unauthorized");
        }
        return await ctx.db
            .query("reviews")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", args.widgetId))
            .order("desc")
            .collect();
    },
});

export const getAllByUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        // Get all widgets for user
        const widgets = await ctx.db
            .query("widgets")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        // Get all reviews for all widgets
        const allReviews = [];
        for (const widget of widgets) {
            const reviews = await ctx.db
                .query("reviews")
                .withIndex("by_widget_id", (q) => q.eq("widgetId", widget._id))
                .collect();
            allReviews.push(...reviews);
        }

        // Sort by createdAt descending
        return allReviews.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const updateSentiment = internalMutation({
    args: {
        id: v.id("reviews"),
        sentiment: v.union(v.literal("Positive"), v.literal("Questionable"), v.literal("Spam")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { sentiment: args.sentiment });
    },
});

export const updateSentimentAndVisibility = internalMutation({
    args: {
        id: v.id("reviews"),
        sentiment: v.union(v.literal("Positive"), v.literal("Questionable"), v.literal("Spam")),
        isVisible: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { 
            sentiment: args.sentiment,
            isVisible: args.isVisible 
        });
    },
});

export const updateNpsCategory = internalMutation({
    args: {
        id: v.id("reviews"),
        npsCategory: v.union(v.literal("Promoter"), v.literal("Detractor"), v.literal("Passive")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { npsCategory: args.npsCategory });
    },
});

export const createInternal = internalMutation({
    args: {
        widgetId: v.id("widgets"),
        externalId: v.string(),
        author: v.string(),
        rating: v.number(),
        content: v.string(),
        sentiment: v.union(v.literal("Positive"), v.literal("Questionable"), v.literal("Spam")),
        isVisible: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("reviews", {
            widgetId: args.widgetId,
            externalId: args.externalId,
            author: args.author,
            rating: args.rating,
            content: args.content,
            sentiment: args.sentiment,
            npsCategory: undefined,
            isVisible: args.isVisible,
            createdAt: Date.now(),
        });
    },
});

export const toggleVisibility = mutation({
    args: { id: v.id("reviews") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const review = await ctx.db.get(args.id);
        if (!review) throw new Error("Review not found");
        const widget = await ctx.db.get(review.widgetId);
        if (!widget || widget.userId !== userId) {
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id, { isVisible: !review.isVisible });
        return { isVisible: !review.isVisible };
    },
});

export const createReview = mutation({
    args: {
        widgetId: v.id("widgets"),
        externalId: v.string(),
        author: v.string(),
        rating: v.number(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const widget = await ctx.db.get(args.widgetId);
        if (!widget || widget.userId !== userId) {
            throw new Error("Unauthorized");
        }
        return await ctx.db.insert("reviews", {
            widgetId: args.widgetId,
            externalId: args.externalId,
            author: args.author,
            rating: args.rating,
            content: args.content,
            sentiment: null,
            npsCategory: undefined,
            isVisible: true,
            createdAt: Date.now(),
        });
    },
});
