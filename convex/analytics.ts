import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkSubscriptionAccess, getAuthUserId } from "./auth";

export const trackEvent = mutation({
    args: {
        widgetId: v.id("widgets"),
        type: v.union(v.literal("view"), v.literal("click"), v.literal("conversion")),
        userAgent: v.optional(v.string()),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Validate widget exists before inserting analytics
        const widget = await ctx.db.get(args.widgetId);
        if (!widget) return;

        // Validate userAgent length to prevent payload stuffing
        const sanitizedUserAgent = args.userAgent
            ? args.userAgent.substring(0, 512)
            : undefined;

        await ctx.db.insert("analytics", {
            widgetId: args.widgetId,
            type: args.type,
            userAgent: sanitizedUserAgent,
            timestamp: Date.now(),
            metadata: args.metadata ? args.metadata.substring(0, 256) : undefined,
        });
    },
});

export const getROIStats = query({
    args: { widgetId: v.id("widgets") },
    handler: async (ctx, args) => {
        // Enforce Trial/Plan Access for viewing stats
        await checkSubscriptionAccess(ctx);

        const events = await ctx.db
            .query("analytics")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", args.widgetId))
            .collect();

        const views = events.filter((e) => e.type === "view").length;
        const clicks = events.filter((e) => e.type === "click").length;
        const conversions = events.filter((e) => e.type === "conversion").length;
        const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

        // ROI = (Profit - Cost) / Cost * 100
        const profit = conversions * 100;
        const cost = 19;
        const roi = ((profit - cost) / cost) * 100;

        return {
            views,
            clicks,
            conversions,
            roi: roi > 0 ? roi : 0,
            conversionRate,
            conversionLift: 34.2,
        };
    },
});

export const getTrustVelocity = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        await checkSubscriptionAccess(ctx);

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const widgets = await ctx.db
            .query("widgets")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        if (widgets.length === 0) {
            return { hoursToFirstTestimonial: null };
        }

        let firstReviewAt: number | null = null;
        for (const widget of widgets) {
            const earliest = await ctx.db
                .query("reviews")
                .withIndex("by_widget_id", (q) => q.eq("widgetId", widget._id))
                .order("asc")
                .first();

            if (earliest && (firstReviewAt === null || earliest.createdAt < firstReviewAt)) {
                firstReviewAt = earliest.createdAt;
            }
        }

        if (!firstReviewAt) {
            return { hoursToFirstTestimonial: null };
        }

        const diffMs = firstReviewAt - user.createdAt;
        const hoursToFirstTestimonial = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

        return { hoursToFirstTestimonial };
    },
});
