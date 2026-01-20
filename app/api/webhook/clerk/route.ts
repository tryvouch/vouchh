import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!);

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

export async function POST(req: NextRequest) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
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

    const webhookId = svixId;
    const wasProcessed = await convex.query(api.webhooks.isProcessed, { webhookId });
    if (wasProcessed) {
        return NextResponse.json({ received: true });
    }

    const { type, data } = event;
    await convex.mutation(api.webhooks.record, { webhookId, type });
    const email = data.email_addresses?.[0]?.email_address || "";

    if (type === "user.created" || type === "user.updated") {
        if (!data.id || !email) {
            return NextResponse.json({ error: "Missing user data" }, { status: 400 });
        }
        await convex.mutation(api.users.upsertFromClerk, {
            clerkId: data.id,
            email,
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
        });
    }

    if (type === "user.deleted") {
        if (!data.id) {
            return NextResponse.json({ error: "Missing user id" }, { status: 400 });
        }
        await convex.mutation(api.users.deleteByClerkId, {
            clerkId: data.id,
        });
    }

    return NextResponse.json({ received: true });
}
