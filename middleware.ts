import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/widget(.*)',
    '/api/webhook(.*)',
    '/pricing(.*)', // Pricing is usually public
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    // A/B Testing Middleware
    // Split-test two widget designs (Control vs Glow-Variant)
    const response = NextResponse.next();
    const abCookie = request.cookies.get('vouch-ab-variant');

    if (!abCookie) {
        // 50/50 Split
        const variant = Math.random() < 0.5 ? 'control' : 'glow-variant';
        response.cookies.set('vouch-ab-variant', variant, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax',
        });
    }

    return response;
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
