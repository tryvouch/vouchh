import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!);
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.DODO_WEBHOOK_SECRET;
        if (!secret) {
            return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
        }

        const rawBody = await req.text();
        const signature = req.headers.get("dodo-signature");
        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
        const expectedBuffer = Buffer.from(expected, "utf8");
        const signatureBuffer = Buffer.from(signature, "utf8");
        if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const webhookId = req.headers.get("webhook-id") || `wh_${Date.now()}_${Math.random().toString(36).substring(2)}`;

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

                // Use IDEMPOTENT mutation
                await convex.mutation(api.billing.syncSubscriptionIdempotent, {
                    webhookId,
                    eventType: type,
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
                    // Use IDEMPOTENT mutation
                    await convex.mutation(api.billing.syncSubscriptionIdempotent, {
                        webhookId,
                        eventType: type,
                        clerkId,
                        dodoPaymentId: data.id,
                        status: "cancelled",
                        currentPeriodEnd: Date.now(),
                        trialEndsAt: undefined,
                    });
                }
                break;
            }

            case "payment.failed": {
                const clerkId = data.metadata?.clerk_id || data.customer_id;
                if (clerkId) {
                    await convex.mutation(api.billing.handlePaymentFailed, {
                        webhookId,
                        clerkId,
                        dodoPaymentId: data.id,
                    });
                }
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
