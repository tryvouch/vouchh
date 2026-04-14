import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

export const runtime = "nodejs";

type ClerkWebhookEvent = {
    type: string;
    data: {
        id: string;
        email_addresses?: { email_address: string }[];
        first_name?: string | null;
        last_name?: string | null;
    };
};

/**
 * Clerk Webhook Handler
 * Verifies Svix signature, then forwards to Convex HTTP action for processing.
 * This keeps all mutation logic in Convex (internal) while using Next.js for signature verification.
 */
export async function POST(req: NextRequest) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        return NextResponse.json({ error: "Missing Convex URL" }, { status: 500 });
    }

    const payload = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
    }
    const svixHeaders = {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
    };

    let event: ClerkWebhookEvent;
    try {
        const webhook = new Webhook(secret);
        event = webhook.verify(payload, svixHeaders) as ClerkWebhookEvent;
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Forward verified event to Convex HTTP action for processing
    const convexSiteUrl = convexUrl.replace(".cloud", ".site");
    try {
        const response = await fetch(`${convexSiteUrl}/clerk-webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                webhookId: svixId,
                type: event.type,
                data: event.data,
            }),
        });

        if (!response.ok) {
            console.error("Convex clerk-webhook error:", await response.text());
            return NextResponse.json({ error: "Processing failed" }, { status: 500 });
        }
    } catch (error) {
        console.error("Failed to forward to Convex:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
