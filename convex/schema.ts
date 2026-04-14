import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        plan: v.union(v.literal("free"), v.literal("pro")),
        createdAt: v.number(),
    }).index("by_clerk_id", ["clerkId"]),

    widgets: defineTable({
        userId: v.id("users"),
        name: v.string(),
        sourceType: v.union(v.literal("google"), v.literal("yelp"), v.literal("manual")),
        sourceId: v.string(),
        settings: v.any(),
        createdAt: v.number(),
    }).index("by_user_id", ["userId"]),

    reviews: defineTable({
        widgetId: v.id("widgets"),
        externalId: v.string(),
        author: v.string(),
        rating: v.number(),
        content: v.string(),
        sentiment: v.union(
            v.literal("Positive"),
            v.literal("Questionable"),
            v.literal("Spam"),
            v.null()
        ),
        npsCategory: v.optional(
            v.union(v.literal("Promoter"), v.literal("Detractor"), v.literal("Passive"))
        ),
        isVisible: v.boolean(),
        createdAt: v.number(),
    }).index("by_widget_id", ["widgetId"]),

    subscriptions: defineTable({
        userId: v.id("users"),
        dodoId: v.string(), // Legacy field name — now stores RevenueCat ID
        status: v.union(
            v.literal("active"),
            v.literal("cancelled"),
            v.literal("past_due"),
            v.literal("trialing"),
            v.literal("hibernating")
        ),
        currentPeriodEnd: v.number(),
        trialEndsAt: v.optional(v.number()),
        isSubscriptionActive: v.boolean(),
    }).index("by_user_id", ["userId"]),

    analytics: defineTable({
        widgetId: v.id("widgets"),
        type: v.union(v.literal("view"), v.literal("click"), v.literal("conversion")),
        userAgent: v.optional(v.string()),
        timestamp: v.number(),
        metadata: v.optional(v.string()),
    }).index("by_widget_id", ["widgetId"]),

    paymentFailures: defineTable({
        userId: v.id("users"),
        subscriptionId: v.id("subscriptions"),
        email: v.string(),
        failedAt: v.number(),
        status: v.union(v.literal("new"), v.literal("urgent_sent"), v.literal("final_sent"), v.literal("resolved")),
        lastEmailSentAt: v.optional(v.number()),
    }).index("by_status", ["status"]),

    processed_webhooks: defineTable({
        webhookId: v.string(),
        processedAt: v.number(),
        type: v.string(),
    }).index("by_webhook_id", ["webhookId"]),
});
