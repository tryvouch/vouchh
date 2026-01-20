"use client";

import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";

/**
 * Shopify-style Floating Composition
 * Multi-source sync visualization with floating review cards
 */
export function FloatingComposition() {
    const floatVariants = {
        animate: (delay: number) => ({
            y: [0, -12, 0],
            rotate: [0, 2, 0],
            transition: {
                duration: 4 + delay,
                repeat: Infinity,
                ease: "easeInOut" as const,
                delay: delay
            }
        })
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Google Review Card */}
            <motion.div
                className="absolute left-4 bottom-16 w-32 h-24 bg-white dark:bg-[#1A1A1A] border border-border/50 p-3 flex flex-col justify-between shadow-lg"
                style={{ rotate: -4 }}
                variants={floatVariants}
                animate="animate"
                custom={0}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        G
                    </div>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                    &quot;Excellent service...&quot;
                </p>
            </motion.div>

            {/* Yelp Review Card */}
            <motion.div
                className="absolute right-8 top-20 w-32 h-24 bg-white dark:bg-[#1A1A1A] border border-border/50 p-3 flex flex-col justify-between shadow-lg"
                style={{ rotate: 3 }}
                variants={floatVariants}
                animate="animate"
                custom={0.5}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-[10px] font-bold text-red-600 dark:text-red-400">
                        Y
                    </div>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                    &quot;Great experience...&quot;
                </p>
            </motion.div>

            {/* Manual Review Card */}
            <motion.div
                className="absolute right-4 bottom-8 w-32 h-24 bg-white dark:bg-[#1A1A1A] border border-border/50 p-3 flex flex-col justify-between shadow-lg"
                style={{ rotate: -2 }}
                variants={floatVariants}
                animate="animate"
                custom={1}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                    &quot;Highly recommend...&quot;
                </p>
            </motion.div>

            {/* Sync Indicator */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="glass-panel px-4 py-2 flex items-center gap-2 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium tracking-tight">Syncing...</span>
                </div>
            </motion.div>
        </div>
    );
}
