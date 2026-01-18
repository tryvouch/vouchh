"use client";

import { motion } from "framer-motion";
import { Star, Check, Zap } from "lucide-react";

export function HeroComposition() {
    const float = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut" as const,
            },
        },
    };

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center pointer-events-none select-none">

            {/* 1. Google Review Card (Bottom layer) */}
            <motion.div
                variants={float}
                initial="animate"
                animate="animate"
                className="absolute left-0 bottom-10 z-10 bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow-xl border border-black/5 w-72"
                style={{ rotate: -6 }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">J</div>
                    <div>
                        <div className="font-semibold text-sm">Jason M.</div>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5 ml-auto" alt="Google" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    "We saw a 30% uplift in sales after installing Vouch. It's magic."
                </p>
            </motion.div>

            {/* 2. AI Processing Tag (Mid layer) */}
            <motion.div
                variants={float}
                animate="animate"
                transition={{ delay: 0.5 }} // Stagger
                className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium">AI: POSITIVE (99%)</span>
                </div>
            </motion.div>

            {/* 3. The Vouch Widget (Top layer) */}
            <motion.div
                variants={float}
                animate="animate"
                transition={{ delay: 1 }} // Stagger
                className="absolute right-0 top-10 z-30 bg-black dark:bg-white text-white dark:text-black p-6 rounded-2xl shadow-2xl border border-white/10 w-80"
                style={{ rotate: 3 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-black p-1 rounded">
                            <Check className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Vouch</span>
                    </div>
                    <span className="text-xs opacity-50">Verified</span>
                </div>

                <div className="space-y-3">
                    <div className="bg-white/10 dark:bg-black/5 p-3 rounded-lg flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0" />
                        <div className="space-y-1.5 w-full">
                            <div className="w-24 h-2 bg-white/20 dark:bg-black/10 rounded" />
                            <div className="w-full h-2 bg-white/10 dark:bg-black/5 rounded" />
                            <div className="w-2/3 h-2 bg-white/10 dark:bg-black/5 rounded" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs opacity-60">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Powered by Gemini</span>
                </div>
            </motion.div>

        </div>
    );
}
