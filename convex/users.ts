import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return await ctx.db.get(userId);
    },
});

/**
 * INTERNAL mutation — only callable from Clerk webhook handler.
 * Previously was a public mutation which allowed any client to create/update
 * user records with arbitrary clerkId and email values.
 */
export const upsertFromClerk = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                email: args.email,
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            plan: "free",
            createdAt: Date.now(),
        });
    },
});

/**
 * INTERNAL mutation — only callable from Clerk webhook handler.
 * Previously was a public mutation which allowed any client to delete
 * ANY user by supplying their clerkId.
 */
export const deleteByClerkId = internalMutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
