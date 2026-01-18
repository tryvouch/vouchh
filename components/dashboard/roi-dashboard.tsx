"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ROIDashboardProps {
    widgetId: Id<"widgets">;
}

export function ROIDashboard({ widgetId }: ROIDashboardProps) {
    const stats = useQuery(api.analytics.getROIStats, { widgetId });

    if (!stats) return <div className="h-48 w-full animate-pulse rounded-lg bg-muted/20" />;

    return (
        <div className="relative w-full max-w-md">
            {/* Layer 1: Background Depth */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl opacity-50" />
            
            {/* Layer 2: Glass Panel */}
            <div className="glass-panel relative rounded-xl p-6 overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1 tracking-tight">
                            ROI Dashboard
                        </p>
                        <h3 className="text-4xl font-bold tracking-[-0.03em] elite-kerning">
                            +{stats.roi.toFixed(1)}%
                        </h3>
                        <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Growth
                        </p>
                    </div>
                    <div className="p-2 rounded-full bg-background/50 border border-border/50">
                        <ArrowUpRight className="w-4 h-4 text-foreground/70" />
                    </div>
                </div>

                {/* Layer 3: Metrics */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-white/5 backdrop-blur-sm">
                        <span className="text-sm text-muted-foreground">Estimated Conversion Lift</span>
                        <span className="font-semibold tracking-tight">+{stats.conversionLift}%</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <MetricBox label="Views" value={stats.views} />
                        <MetricBox label="Clicks" value={stats.clicks} />
                        <MetricBox label="Conversions" value={stats.conversions} />
                    </div>
                </div>

                {/* Layer 4: Graph Overlay (Decorational) */}
                <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-20 text-foreground" viewBox="0 0 100 50">
                    <path d="M0 50 Q 25 40, 50 20 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}

function MetricBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/20 border border-white/5">
            <span className="text-xs text-muted-foreground mb-1">{label}</span>
            <span className="font-bold text-lg">{value}</span>
        </div>
    );
}
