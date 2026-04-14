"use node";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const mockReviews = [
    {
        author: "Sarah Mitchell",
        rating: 5,
        content: "Absolutely incredible service! The team went above and beyond to help us. Would recommend to anyone looking for quality.",
        sentiment: "Positive" as const,
    },
    {
        author: "James Anderson",
        rating: 5,
        content: "Best decision we ever made. Our conversion rate jumped 40% after implementing their solution.",
        sentiment: "Positive" as const,
    },
    {
        author: "Emily Chen",
        rating: 4,
        content: "Great product overall. Easy to set up and the support team is very responsive. Minor UI quirks but nothing major.",
        sentiment: "Questionable" as const,
    },
    {
        author: "Michael Brown",
        rating: 5,
        content: "Game changer for our business. The AI features are incredibly accurate and save us hours every week.",
        sentiment: "Positive" as const,
    },
    {
        author: "Lisa Rodriguez",
        rating: 3,
        content: "Decent service but took longer than expected to see results. Customer support could be more proactive.",
        sentiment: "Questionable" as const,
    },
    {
        author: "David Kim",
        rating: 1,
        content: "This is a scam. Do not buy.",
        sentiment: "Spam" as const,
    },
    {
        author: "Jennifer Taylor",
        rating: 5,
        content: "Outstanding! This platform has transformed how we collect and display social proof. Highly recommend!",
        sentiment: "Positive" as const,
    },
    {
        author: "B0tUser_99",
        rating: 5,
        content: "CLICK HERE FOR FREE IPHONE: http://malware.link",
        sentiment: "Spam" as const,
    },
];

/**
 * INTERNAL action — only callable from Convex dashboard or other internal functions.
 * Previously was a public action which allowed any client to create unlimited fake reviews.
 */
export const seedReviews = internalAction({
    args: {
        userId: v.id("users"),
        widgetId: v.id("widgets"),
    },
    handler: async (ctx, args): Promise<{ created: number }> => {
        const createdReviews = [];

        for (const review of mockReviews) {
            const reviewId = await ctx.runMutation(internal.reviews.createInternal, {
                widgetId: args.widgetId,
                externalId: `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                author: review.author,
                rating: review.rating,
                content: review.content,
                sentiment: review.sentiment,
                isVisible: true,
            });
            createdReviews.push(reviewId);
        }

        return { created: createdReviews.length };
    },
});
