"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BillingPeriod } from "@/lib/revenuecat";

interface BillingToggleProps {
    billingPeriod: BillingPeriod;
    onBillingPeriodChange: (period: BillingPeriod) => void;
}

/**
 * Elite Billing Toggle Component
 * Studio Elite Design - Sharp edges, mathematical precision
 */
export function BillingToggle({ billingPeriod, onBillingPeriodChange }: BillingToggleProps) {
    return (
        <div className="flex items-center justify-center gap-4 mb-8">
            <button
                onClick={() => onBillingPeriodChange("monthly")}
                className={`px-6 py-2 font-medium tracking-tight transition-all ${
                    billingPeriod === "monthly"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Monthly
            </button>
            
            {/* Toggle Switch - Elite Design */}
            <button
                onClick={() => onBillingPeriodChange(billingPeriod === "monthly" ? "annual" : "monthly")}
                className="relative w-14 h-8 bg-secondary border border-border flex items-center transition-all group cursor-pointer"
                aria-label="Toggle billing period"
                type="button"
            >
                <motion.div
                    className="absolute w-6 h-6 bg-foreground flex items-center justify-center"
                    initial={false}
                    animate={{
                        x: billingPeriod === "annual" ? 28 : 2,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                    }}
                >
                    <Check className="w-3.5 h-3.5 text-background" />
                </motion.div>
            </button>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onBillingPeriodChange("annual")}
                    className={`px-6 py-2 font-medium tracking-tight transition-all ${
                        billingPeriod === "annual"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Annual
                </button>
                {billingPeriod === "annual" && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium tracking-tight elite-mono"
                    >
                        Save 13%
                    </motion.span>
                )}
            </div>
        </div>
    );
}
