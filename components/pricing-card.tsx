"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { dodoConfig, getDodoCheckoutUrl } from "@/lib/dodo";
import { useUser } from "@clerk/nextjs";

interface PricingCardProps {
    variant?: "default" | "featured";
}

export function PricingCard({ variant = "default" }: PricingCardProps) {
    const { user } = useUser();

    const handleCheckout = () => {
        const checkoutUrl = getDodoCheckoutUrl({
            productId: dodoConfig.monthlyProductId,
            billingPeriod: "monthly",
            customerId: user?.id,
            successUrl: `${window.location.origin}/dashboard?success=true`,
            cancelUrl: `${window.location.origin}/pricing?cancelled=true`,
            trialDays: dodoConfig.trialDays,
        });
        window.location.href = checkoutUrl;
    };

    const features = [
        "Unlimited reviews sync",
        "AI Sentiment Analysis",
        "Multi-source integration",
        "Custom widget styling",
        "White-label option",
        "Priority support",
    ];

    return (
        <div className={`glass-card p-8 relative ${variant === "featured" ? "glow" : ""}`}>
            {variant === "featured" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                    </span>
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">${dodoConfig.proPlanPrice}</span>
                    <span className="text-white/50">/month</span>
                </div>
                <p className="text-sm text-white/50 mt-2">
                    7-day free trial included
                </p>
            </div>

            <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>

            <Button
                onClick={handleCheckout}
                className="w-full bg-white text-black hover:bg-white/90 font-medium h-11"
            >
                Start Free Trial
            </Button>
        </div>
    );
}
