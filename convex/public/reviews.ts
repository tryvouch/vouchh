import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Public API endpoint for widget reviews
 * No authentication required - used by embedded widget
 */
export const getWidgetReviews = query({
    args: { widgetId: v.id("widgets") },
    handler: async (ctx, args) => {
        const widget = await ctx.db.get(args.widgetId);

        if (!widget) {
            return [];
        }

        // Get visible reviews only
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_widget_id", (q) => q.eq("widgetId", widget._id))
            .filter((q) => q.eq(q.field("isVisible"), true))
            .order("desc")
            .take(10); // Limit to 10 for performance

        return reviews.map((review) => ({
            _id: review._id,
            author: review.author,
            rating: review.rating,
            content: review.content,
            sentiment: review.sentiment,
            createdAt: review.createdAt,
        }));
    },
});
