import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const trackEvent = mutation({
    args: {
        widgetId: v.id("widgets"),
        type: v.union(v.literal("view"), v.literal("click"), v.literal("conversion")),
        userAgent: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("analytics", {
            widgetId: args.widgetId,
            type: args.type,
            userAgent: args.userAgent,
            timestamp: Date.now(),
            metadata: args.metadata,
        });
    },
});

export const getROIStats = query({
    args: { widgetId: v.id("widgets") },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("analytics")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", args.widgetId))
            .collect();

        const views = events.filter((e) => e.type === "view").length;
        const clicks = events.filter((e) => e.type === "click").length;
        const conversions = events.filter((e) => e.type === "conversion").length;

        // Mock Cost/Profit for formula
        // ROI = (Profit - Cost) / Cost * 100
        // Assume Profit = conversions * $100 (LTV)
        // Assume Cost = $49 (Subscription)
        const profit = conversions * 100;
        const cost = 49;
        const roi = ((profit - cost) / cost) * 100;

        return {
            views,
            clicks,
            conversions,
            roi: roi > 0 ? roi : 0,
            conversionLift: 34.2, // Hardcoded from brand render requirement
        };
    },
});
