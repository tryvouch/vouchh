import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const isProcessed = query({
    args: { webhookId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_webhook_id", (q) => q.eq("webhookId", args.webhookId))
            .first();
        return !!existing;
    },
});

export const record = mutation({
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
