"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface UpgradeButtonProps {
    trialDaysRemaining?: number;
}

/**
 * Elite Upgrade Button - Studio Elite Design
 * Sharp edges, mathematical precision, no generic gradients
 * Redirects to pricing page for billing selection
 */
export function UpgradeButton({ trialDaysRemaining }: UpgradeButtonProps) {
    const isTrialActive = trialDaysRemaining && trialDaysRemaining > 0;

    return (
        <Link href="/pricing">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-3 bg-foreground text-background font-medium tracking-tight overflow-hidden group transition-all"
            >
                {/* Subtle hover effect - no neon colors */}
                <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <span className="relative flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4" />
                    {isTrialActive ? "Upgrade to Pro" : "Unlock Pro"}
                </span>
            </motion.button>
        </Link>
    );
}
