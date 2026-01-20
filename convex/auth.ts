import { QueryCtx, MutationCtx, internalQuery } from "./_generated/server";

export const verifyAccess = internalQuery({
    args: {},
    handler: async (ctx) => {
        await checkSubscriptionAccess(ctx);
    }
});


export async function getAuthUserId(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

    if (!user) {
        throw new Error("User not found");
    }

    return user._id;
}

export async function checkSubscriptionAccess(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    
    const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique();

    if (!subscription) {
        throw new Error("SubscriptionError: No subscription found");
    }

    // Backend Trial/Plan Enforcement
    const now = Date.now();
    const isTrialActive = subscription.status === "trialing" && subscription.trialEndsAt && subscription.trialEndsAt > now;
    const isActive = subscription.status === "active";
    
    if (!isActive && !isTrialActive) {
        // Trigger Paywall Overlay via specific error code
        throw new Error("SubscriptionError: Plan expired. Upgrade to restore access.");
    }

    return userId;
}
