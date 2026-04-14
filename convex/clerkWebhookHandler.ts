import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Convex HTTP Action for processing Clerk webhooks.
 * Called from the Next.js API route after Svix signature verification.
 * Uses internal mutations to maintain security.
 */
export const processClerkWebhook = httpAction(async (ctx, request) => {
    const payload = await request.json();
    const { webhookId, type, data } = payload;

    if (!webhookId || !type || !data) {
        return new Response("Invalid payload", { status: 400 });
    }

    // Idempotency check
    const wasProcessed = await ctx.runQuery(internal.webhooks.isProcessed, { webhookId });
    if (wasProcessed) {
        return new Response("Already processed", { status: 200 });
    }

    // Record webhook
    await ctx.runMutation(internal.webhooks.record, { webhookId, type });

    const email = data.email_addresses?.[0]?.email_address || "";

    if (type === "user.created" || type === "user.updated") {
        if (!data.id || !email) {
            return new Response("Missing user data", { status: 400 });
        }
        await ctx.runMutation(internal.users.upsertFromClerk, {
            clerkId: data.id,
            email,
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
        });
    }

    if (type === "user.deleted") {
        if (!data.id) {
            return new Response("Missing user id", { status: 400 });
        }
        await ctx.runMutation(internal.users.deleteByClerkId, {
            clerkId: data.id,
        });
    }

    return new Response("Processed", { status: 200 });
});
