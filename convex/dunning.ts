import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Called when a payment fails (e.g. via webhook)
export const reportPaymentFailure = internalMutation({
    args: {
        userId: v.id("users"),
        subscriptionId: v.id("subscriptions"),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if already exists
        const existing = await ctx.db
            .query("paymentFailures")
            .withIndex("by_status", (q) => q.eq("status", "new"))
            .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
            .first();

        if (existing) return;

        await ctx.db.insert("paymentFailures", {
            userId: args.userId,
            subscriptionId: args.subscriptionId,
            email: args.email,
            failedAt: Date.now(),
            status: "new",
        });
    },
});

export const checkFailures = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const failures = await ctx.db.query("paymentFailures").collect();

        for (const failure of failures) {
            if (failure.status === "resolved") continue;

            const daysSinceFailure = (now - failure.failedAt) / (1000 * 60 * 60 * 24);

            if (failure.status === "new" && daysSinceFailure >= 1) {
                // Day 1: Failed
                await ctx.scheduler.runAfter(0, internal.dunning.sendDunningEmail, {
                    email: failure.email,
                    templateId: "failed_payment_day_1",
                    failureId: failure._id,
                    nextStatus: "urgent_sent",
                });
            } else if (failure.status === "urgent_sent" && daysSinceFailure >= 3) {
                // Day 3: Urgent
                await ctx.scheduler.runAfter(0, internal.dunning.sendDunningEmail, {
                    email: failure.email,
                    templateId: "failed_payment_day_3",
                    failureId: failure._id,
                    nextStatus: "final_sent",
                });
            } else if (failure.status === "final_sent" && daysSinceFailure >= 7) {
                // Day 7: Final Notice + Hibernation Link
                await ctx.scheduler.runAfter(0, internal.dunning.sendDunningEmail, {
                    email: failure.email,
                    templateId: "failed_payment_day_7_hibernation",
                    failureId: failure._id,
                    nextStatus: "resolved", // Or 'terminated'
                });
            }
        }
    },
});

export const sendDunningEmail = internalAction({
    args: {
        email: v.string(),
        templateId: v.string(),
        failureId: v.id("paymentFailures"),
        nextStatus: v.union(v.literal("urgent_sent"), v.literal("final_sent"), v.literal("resolved")),
    },
    handler: async (ctx, args) => {
        await ctx.runMutation(internal.dunning.updateFailureStatus, {
            failureId: args.failureId,
            status: args.nextStatus,
        });
    },
});

export const updateFailureStatus = internalMutation({
    args: {
        failureId: v.id("paymentFailures"),
        status: v.union(v.literal("urgent_sent"), v.literal("final_sent"), v.literal("resolved")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.failureId, {
            status: args.status,
            lastEmailSentAt: Date.now(),
        });
    },
});
