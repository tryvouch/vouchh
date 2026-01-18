"use client";

import { motion } from "framer-motion";

/**
 * Elite V Logo: Technical minimalist 'V' that acts as a checkmark slash
 * Studio Elite design - sharp edges, mathematical precision
 */
export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-foreground"
        >
            {/* V as checkmark slash - mathematical precision */}
            <motion.path
                d="M8 24 L16 8 L24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            {/* Subtle slash accent for checkmark feel */}
            <motion.path
                d="M6 26 L26 6"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="square"
                strokeDasharray="2 2"
                className="opacity-30"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
        </svg>
    </div>
  );
}
