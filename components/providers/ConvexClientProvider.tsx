"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const client = useMemo(() => {
        if (!convexUrl) return null;
        return new ConvexReactClient(convexUrl);
    }, [convexUrl]);

    if (!client) {
        return <ClerkProvider>{children}</ClerkProvider>;
    }

    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={client} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
