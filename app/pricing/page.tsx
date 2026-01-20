"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { dodoConfig, getDodoCheckoutUrl, type BillingPeriod } from "@/lib/dodo";
import { useUser } from "@clerk/nextjs";
import { BillingToggle } from "@/components/pricing/billing-toggle";

export default function PricingPage() {
    const { user } = useUser();
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

    const handleCheckout = () => {
        const productId = billingPeriod === "monthly" 
            ? dodoConfig.monthlyProductId 
            : dodoConfig.annualProductId;

        const checkoutUrl = getDodoCheckoutUrl({
            productId,
            billingPeriod,
            customerId: user?.id,
            successUrl: `${window.location.origin}/dashboard?upgraded=true`,
            cancelUrl: `${window.location.origin}/pricing`,
            trialDays: dodoConfig.trialDays,
        });
        window.location.href = checkoutUrl;
    };

    const features = [
        "Unlimited reviews sync",
        "AI Sentiment Analysis (Gemini 1.5 Flash)",
        "Multi-source integration (Google, Yelp, Manual)",
        "Custom widget styling",
        "Real-time Trust Score",
        "Priority support",
    ];

    const price = billingPeriod === "monthly" ? dodoConfig.monthlyPrice : dodoConfig.annualPrice;
    const monthlyEquivalent = billingPeriod === "annual" ? Math.round(dodoConfig.annualPrice / 12) : dodoConfig.monthlyPrice;

    return (
        <div className="min-h-screen bg-background">
            {/* Elite Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/90 backdrop-blur-[20px]">
                <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-xl tracking-[-0.02em] elite-kerning">Vouch</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <Link href="/sign-in">
                            <Button variant="ghost" className="font-medium tracking-tight">Log in</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Pricing Section */}
            <section className="pt-40 pb-32 px-8 max-w-[1400px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center mb-20"
                >
                    <h1 className="text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] elite-kerning mb-6">
                        Simple Pricing
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto tracking-tight">
                        Start with a {dodoConfig.trialDays}-day free trial. No credit card required.
                    </p>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex justify-center mb-8"
                >
                    <BillingToggle 
                        billingPeriod={billingPeriod} 
                        onBillingPeriodChange={setBillingPeriod}
                    />
                </motion.div>

                {/* Pricing Card - Elite Design */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="glass-panel p-12 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-foreground text-background text-sm font-medium tracking-tight">
                                <Sparkles className="h-3.5 w-3.5" />
                                Pro Plan
                            </span>
                        </div>

                        <div className="text-center mb-12">
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <span className="text-6xl font-bold elite-mono tracking-tight">${price}</span>
                                <span className="text-muted-foreground text-lg">
                                    /{billingPeriod === "monthly" ? "month" : "year"}
                                </span>
                            </div>
                            {billingPeriod === "annual" && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-muted-foreground tracking-tight elite-mono"
                                >
                                    ${monthlyEquivalent}/month billed annually
                                </motion.p>
                            )}
                            <p className="text-sm text-muted-foreground tracking-tight mt-4">
                                {dodoConfig.trialDays}-day free trial • Cancel anytime
                            </p>
                        </div>

                        <ul className="space-y-4 mb-12">
                            {features.map((feature, index) => (
                                <motion.li
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 bg-foreground/10 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-foreground" />
                                    </div>
                                    <span className="text-base tracking-tight">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.button
                            onClick={handleCheckout}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-14 bg-foreground text-background font-medium tracking-tight flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
                        >
                            Start Free Trial
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>

                        <p className="text-center text-xs text-muted-foreground mt-6 tracking-tight">
                            No credit card required. Trial converts to paid after {dodoConfig.trialDays} days.
                        </p>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mt-24 max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl font-bold tracking-tight elite-kerning mb-12 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-8">
                        {[
                            {
                                q: `What happens after the ${dodoConfig.trialDays}-day trial?`,
                                a: `Your trial automatically converts to a paid Pro subscription at $${billingPeriod === "monthly" ? "49/month" : "499/year"}. You can cancel anytime before the trial ends with no charges.`
                            },
                            {
                                q: "Can I cancel anytime?",
                                a: "Yes, you can cancel your subscription at any time. Your access continues until the end of the current billing period."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards and debit cards through Dodo Payments, our secure payment processor."
                            },
                            {
                                q: "Do you offer refunds?",
                                a: `We offer a ${dodoConfig.trialDays}-day free trial so you can test everything risk-free. If you're not satisfied, cancel before the trial ends.`
                            },
                            {
                                q: "Can I switch between monthly and annual billing?",
                                a: "Yes, you can switch your billing period at any time. Annual plans save you 15% compared to monthly billing."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                className="border-b border-border pb-8"
                            >
                                <h3 className="text-lg font-semibold tracking-tight mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground tracking-tight leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
