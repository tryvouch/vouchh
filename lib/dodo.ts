export const dodoConfig = {
    publishableKey: process.env.NEXT_PUBLIC_DODO_PUBLISHABLE_KEY || "",
    // Monthly plan
    monthlyProductId: "pdt_0NWT11ZCTOftJ0ErzVwIv",
    monthlyPrice: 49,
    // Annual plan
    annualProductId: "pdt_0NWT1N2cSw0Xu6VRyh2FJ",
    annualPrice: 499,
    // Legacy support
    proPlanPriceId: "price_vouch_pro_49",
    trialDays: 14,
    proPlanPrice: 49,
};

export type BillingPeriod = "monthly" | "annual";

export function getDodoCheckoutUrl(params: {
    productId: string;
    billingPeriod: BillingPeriod;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
}) {
    const baseUrl = "https://checkout.dodopayments.com";
    const queryParams = new URLSearchParams({
        product_id: params.productId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        ...(params.customerId && { customer_id: params.customerId }),
        ...(params.trialDays && params.trialDays > 0 && { trial_period_days: String(params.trialDays) }),
    });
    return `${baseUrl}?${queryParams.toString()}`;
}
