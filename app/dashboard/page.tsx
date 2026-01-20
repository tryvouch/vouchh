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

export default function DashboardPage() {
    const { user } = useUser();
    
    // In a real app, you'd select the active widget dynamically
    // For the "God Build", we'll mock or grab the first one if available
    const widgets = useQuery(api.widgets.getWidgets);
    const firstWidgetId = widgets?.[0]?._id;

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
                                        <p className="font-medium">Pro Plan (Yearly)</p>
                                        <p className="text-sm text-muted-foreground">Next billing: Jan 18, 2027</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full border border-green-500/20">
                                        Active
                                    </span>
                                </div>
                                
                                <div className="pt-4 border-t border-border/40">
                                    <CancellationFlow />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Toaster />
        </div>
    );
}
