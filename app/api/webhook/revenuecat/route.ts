import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * RevenueCat Webhook Handler
 * Verifies Authorization header, then forwards to Convex HTTP action for processing.
 * All subscription mutations are internal (not callable by clients).
 *
 * RevenueCat uses a shared Authorization header for webhook security
 * (no cryptographic signature — relies on HTTPS + shared secret).
 */
export async function POST(req: NextRequest) {
    try {
        const secret = process.env.REVENUECAT_WEBHOOK_AUTH_SECRET;
        if (!secret) {
            return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
        }

        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
            return NextResponse.json({ error: "Missing Convex URL" }, { status: 500 });
        }

        // Verify Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();
        const event = payload?.event;

        if (!event || !event.type) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Forward verified event to Convex HTTP action
        const convexSiteUrl = convexUrl.replace(".cloud", ".site");
        const response = await fetch(`${convexSiteUrl}/revenuecat-webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: event.type,
                appUserId: event.app_user_id,
                productId: event.product_id,
                expirationAtMs: event.expiration_at_ms,
                transactionId: event.transaction_id || event.id,
                environment: event.environment,
                periodType: event.period_type,
            }),
        });

        if (!response.ok) {
            console.error("Convex revenuecat-webhook error:", await response.text());
            return NextResponse.json({ error: "Processing failed" }, { status: 500 });
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
