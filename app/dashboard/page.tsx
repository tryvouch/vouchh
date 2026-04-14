"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ROIDashboard } from "@/components/dashboard/roi-dashboard";
import { CancellationFlow } from "@/components/billing/cancellation-flow";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

function formatDate(timestamp: number | undefined): string {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusBadge(status: string | undefined) {
    const statusMap: Record<string, { label: string; classes: string }> = {
        active: { label: "Active", classes: "bg-green-500/10 text-green-600 border-green-500/20" },
        trialing: { label: "Trial", classes: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
        past_due: { label: "Past Due", classes: "bg-red-500/10 text-red-600 border-red-500/20" },
        cancelled: { label: "Cancelled", classes: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
        hibernating: { label: "Hibernated", classes: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    };
    const info = statusMap[status || ""] || { label: "Free", classes: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${info.classes}`}>
            {info.label}
        </span>
    );
}

export default function DashboardPage() {
    const { user } = useUser();
    
    const widgets = useQuery(api.widgets.getWidgets);
    const subscription = useQuery(api.billing.getSubscription);
    const firstWidgetId = widgets?.[0]?._id;

    const planLabel = subscription?.status === "active" ? "Pro Plan" : 
                      subscription?.status === "trialing" ? "Pro Plan (Trial)" : 
                      "Free Plan";
    const nextBillingLabel = subscription?.status === "trialing" && subscription?.trialEndsAt
        ? `Trial ends: ${formatDate(subscription.trialEndsAt)}`
        : subscription?.currentPeriodEnd
        ? `Next billing: ${formatDate(subscription.currentPeriodEnd)}`
        : "No active subscription";

    return (
        <div className="min-h-screen bg-background text-foreground">
             <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/90 backdrop-blur-[20px]">
                <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-xl tracking-[-0.02em] elite-kerning">Vouch</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            <main className="pt-32 px-8 max-w-[1400px] mx-auto pb-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-[-0.03em] elite-kerning mb-2">
                        Welcome back, {user?.firstName || "Legend"}
                    </h1>
                    <p className="text-muted-foreground">Here is your reputation performance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: ROI & Stats */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-6 tracking-tight">Live ROI Analysis</h2>
                            {firstWidgetId ? (
                                <ROIDashboard widgetId={firstWidgetId} />
                            ) : (
                                <div className="glass-panel p-8 rounded-xl text-center">
                                    <p className="text-muted-foreground mb-4">No active widgets found.</p>
                                    <Button>Create Your First Widget</Button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Account & Settings */}
                    <div className="space-y-8">
                        <section className="glass-panel p-8 rounded-xl">
                            <h2 className="text-xl font-semibold mb-6 tracking-tight">Subscription Management</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50">
                                    <div>
                                        <p className="font-medium">{planLabel}</p>
                                        <p className="text-sm text-muted-foreground">{nextBillingLabel}</p>
                                    </div>
                                    {getStatusBadge(subscription?.status)}
                                </div>
                                
                                {subscription && subscription.status !== "cancelled" && subscription.status !== "hibernating" && (
                                    <div className="pt-4 border-t border-border/40">
                                        <CancellationFlow />
                                    </div>
                                )}

                                {(!subscription || subscription.status === "cancelled") && (
                                    <div className="pt-4 border-t border-border/40">
                                        <Link href="/pricing">
                                            <Button className="w-full bg-foreground text-background hover:opacity-90">
                                                Upgrade to Pro
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Toaster />
        </div>
    );
}
