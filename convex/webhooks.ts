import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * INTERNAL query — prevents external callers from checking webhook processing status.
 * Previously was a public query which could be used to probe for processed webhooks.
 */
export const isProcessed = internalQuery({
    args: { webhookId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();
        return !!existing;
    },
});

/**
 * INTERNAL mutation — prevents external callers from marking webhooks as processed,
 * which could block legitimate webhook processing.
 * Previously was a public mutation.
 */
export const record = internalMutation({
    args: { webhookId: v.string(), type: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();

        if (existing) {
            return { recorded: false };
        }

        await ctx.db.insert("processed_webhooks", {
            webhookId: args.webhookId,
            processedAt: Date.now(),
            type: args.type,
        });

        return { recorded: true };
    },
});
