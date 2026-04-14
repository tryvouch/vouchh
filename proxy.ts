import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/widget(.*)",
    "/api/webhook(.*)",
    "/api/public(.*)",
    "/pricing(.*)",
    "/privacy(.*)",
    "/terms(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    const response = NextResponse.next();

    // Security headers applied at middleware level
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
