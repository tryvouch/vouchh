import { Id } from "./_generated/dataModel";

interface Subscription {
    _id: Id<"subscriptions">;
    userId: Id<"users">;
    dodoId: string;
    status: "active" | "cancelled" | "past_due" | "trialing" | "hibernating";
    currentPeriodEnd: number;
    trialEndsAt?: number;
}

interface User {
    _id: Id<"users">;
    clerkId: string;
    email: string;
    plan: "free" | "pro";
    createdAt: number;
}

export function isTrialActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status !== "trialing") return false;
    return subscription.trialEndsAt ? subscription.trialEndsAt > Date.now() : false;
}

export function canAccessProFeatures(
    user: User | null,
    subscription: Subscription | null
): boolean {
    if (!user) return false;
    if (user.plan === "pro") return true;
    if (subscription?.status === "active") return true;
    return isTrialActive(subscription);
}

export function getTrialDaysRemaining(subscription: Subscription | null): number {
    if (!subscription || !subscription.trialEndsAt) return 0;
    const msRemaining = subscription.trialEndsAt - Date.now();
    if (msRemaining <= 0) return 0;
    return Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
}

export const MAX_FREE_REVIEWS = 3;
