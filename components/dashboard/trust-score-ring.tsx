"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface TrustScoreRingProps {
    score: number; // 0-100
    size?: number;
}

export function TrustScoreRing({ score, size = 120 }: TrustScoreRingProps) {
    const { theme } = useTheme();
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score >= 80) return { color: "#22C55E", glow: "rgba(34, 197, 94, 0.4)" };
        if (score >= 50) return { color: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)" };
        return { color: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" };
    };

    const { color, glow } = getColor();
    const isDark = theme === "dark";
    const bgStroke = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const textColor = isDark ? "white" : "black";

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgStroke}
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-3xl font-bold"
                    style={{ color: textColor }}
                >
                    {score}%
                </motion.span>
                <span className="text-xs text-muted-foreground">Trust Score</span>
            </div>
        </div>
    );
}
