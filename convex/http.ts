import { httpRouter } from "convex/server";
import { processDodoWebhook } from "./billing";

const http = httpRouter();

http.route({
  path: "/dodo-webhook",
  method: "POST",
  handler: processDodoWebhook,
});

export default http;
