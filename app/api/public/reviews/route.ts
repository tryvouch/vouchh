import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const getConvexClient = () => {
    const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
        return null;
    }
    return new ConvexHttpClient(url);
};

// Validate widgetId format to prevent injection
const CONVEX_ID_PATTERN = /^[a-zA-Z0-9_]+$/;

/**
 * Public API endpoint for widget reviews
 * No authentication required - used by embedded widget
 * CORS enabled for cross-origin requests
 */
export async function GET(req: NextRequest) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    };

    try {
        const client = getConvexClient();
        if (!client) {
            return NextResponse.json(
                { error: "Missing deployment address" },
                { status: 500 }
            );
        }
        const { searchParams } = new URL(req.url);
        const widgetId = searchParams.get("widgetId");

        if (!widgetId) {
            return NextResponse.json(
                { error: "widgetId is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate widgetId format
        if (!CONVEX_ID_PATTERN.test(widgetId) || widgetId.length > 64) {
            return NextResponse.json(
                { error: "Invalid widgetId format" },
                { status: 400, headers: corsHeaders }
            );
        }

        try {
            const reviews = await client.query(api.public.reviews.getWidgetReviews, {
                widgetId: widgetId as Id<"widgets">,
            });

            return NextResponse.json(
                reviews || [],
                { headers: corsHeaders }
            );
        } catch {
            return NextResponse.json([], { headers: corsHeaders });
        }
    } catch {
        return NextResponse.json([], { status: 200, headers: corsHeaders });
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
