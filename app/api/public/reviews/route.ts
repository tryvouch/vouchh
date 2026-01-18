import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Public API endpoint for widget reviews
 * No authentication required - used by embedded widget
 * CORS enabled for cross-origin requests
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const widgetId = searchParams.get("widgetId");

        if (!widgetId) {
            return NextResponse.json(
                { error: "widgetId is required" },
                { status: 400 }
            );
        }

        // Use Convex public query to fetch reviews
        // Note: widgetId should be a Convex ID string format
        try {
            const reviews = await convex.query(api.public.reviews.getWidgetReviews, {
                widgetId: widgetId,
            });

            return NextResponse.json(
                reviews || [],
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "Content-Type",
                    },
                }
            );
        } catch (queryError) {
            // If query fails (widget doesn't exist or invalid ID), return empty array
            return NextResponse.json(
                [],
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "Content-Type",
                    },
                }
            );
        }
    } catch (error) {
        // Return empty array on error (graceful degradation)
        return NextResponse.json(
            [],
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }
        );
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
