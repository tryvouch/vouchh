import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const signature = req.headers.get("dodo-signature");

        // TODO: Verify webhook signature with DODO_WEBHOOK_SECRET
        // const isValid = verifySignature(payload, signature, process.env.DODO_WEBHOOK_SECRET!);
        // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

        const { type, data } = payload;

        switch (type) {
            case "subscription.created":
            case "subscription.updated": {
                // Extract customer ID (should be Clerk ID passed during checkout)
                const clerkId = data.metadata?.clerk_id || data.customer_id;

                if (!clerkId) {
                    console.error("No clerk_id in webhook payload");
                    return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
                }

                // Map Dodo status to our status
                const statusMap: Record<string, "active" | "cancelled" | "past_due" | "trialing"> = {
                    active: "active",
                    trialing: "trialing",
                    canceled: "cancelled",
                    past_due: "past_due",
                };

                await convex.mutation(api.billing.syncSubscription, {
                    clerkId,
                    dodoPaymentId: data.id,
                    status: statusMap[data.status] || "active",
                    currentPeriodEnd: new Date(data.current_period_end).getTime(),
                    trialEndsAt: data.trial_end ? new Date(data.trial_end).getTime() : undefined,
                });
                break;
            }

            case "subscription.cancelled":
            case "subscription.deleted": {
                const clerkId = data.metadata?.clerk_id || data.customer_id;

                if (clerkId) {
                    await convex.mutation(api.billing.syncSubscription, {
                        clerkId,
                        dodoPaymentId: data.id,
                        status: "cancelled",
                        currentPeriodEnd: Date.now(),
                    });
                }
                break;
            }

            case "payment.failed": {
                // Payment failed - could trigger email notification here
                // Log to monitoring service in production
                break;
            }

            default:
                // Unhandled webhook type - log to monitoring service in production
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Dodo sends GET to verify endpoint exists
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
