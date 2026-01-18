"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Elite User Initializer
 * Automatically creates user with 7-day Pro trial on first Clerk sign-up
 */
export function UserInitializer() {
    const { user, isLoaded } = useUser();
    const initUser = useMutation(api.billing.initUser);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const initializeUser = async () => {
            try {
                await initUser({
                    clerkId: user.id,
                    email: user.emailAddresses[0]?.emailAddress || "",
                });
            } catch (error) {
                // User might already exist, which is fine - silent fail for idempotency
                // No console logging in production code
            }
        };

        initializeUser();
    }, [user, isLoaded, initUser]);

    return null;
}
