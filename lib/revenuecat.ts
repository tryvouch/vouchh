import { Purchases } from "@revenuecat/purchases-js";

/**
 * RevenueCat Web Billing Configuration
 * Uses Stripe as the underlying payment processor.
 * Products and offerings are configured in the RevenueCat dashboard.
 */
export const revenueCatConfig = {
    /** Public API key — safe to include in client-side code */
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || "",
    /** Entitlement identifier for Pro features */
    entitlementId: "pro",
    /** Display prices (actual prices come from RevenueCat offerings) */
    monthlyPrice: 19,
    annualPrice: 199,
    trialDays: 14,
};

export type BillingPeriod = "monthly" | "annual";

let purchasesInstance: Purchases | null = null;

/**
 * Initialize or retrieve the RevenueCat Purchases instance.
 * Must be called client-side only, with the authenticated user's Clerk ID.
 *
 * @param appUserId - The Clerk user ID (identity.subject). Must be stable and unique.
 */
export function getRevenueCatInstance(appUserId: string): Purchases {
    if (purchasesInstance) {
        return purchasesInstance;
    }

    if (!revenueCatConfig.apiKey) {
        throw new Error("Missing NEXT_PUBLIC_REVENUECAT_API_KEY");
    }

    purchasesInstance = Purchases.configure({
        apiKey: revenueCatConfig.apiKey,
        appUserId,
    });

    return purchasesInstance;
}

/**
 * Check if a user has active Pro entitlement via RevenueCat.
 */
export async function checkProEntitlement(appUserId: string): Promise<boolean> {
    try {
        const purchases = getRevenueCatInstance(appUserId);
        const customerInfo = await purchases.getCustomerInfo();
        return revenueCatConfig.entitlementId in customerInfo.entitlements.active;
    } catch {
        return false;
    }
}
