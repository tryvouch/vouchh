import { httpRouter } from "convex/server";
import { processRevenueCatWebhook } from "./billing";
import { processClerkWebhook } from "./clerkWebhookHandler";

const http = httpRouter();

// Exact match without trailing slash
http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: processRevenueCatWebhook,
});

// Exact match with trailing slash (in case RevenueCat appends it)
http.route({
  path: "/revenuecat-webhook/",
  method: "POST",
  handler: processRevenueCatWebhook,
});

// Also explicitly map Next.js equivalent proxy URL in case they copy-pasted it pointing directly at Convex
http.route({
  path: "/api/webhook/revenuecat",
  method: "POST",
  handler: processRevenueCatWebhook,
});

// ADDED: Root path (/). Your logs show RevenueCat is sending requests directly to the base URL (POST /)
http.route({
  path: "/",
  method: "POST",
  handler: processRevenueCatWebhook,
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: processClerkWebhook,
});

export default http;
