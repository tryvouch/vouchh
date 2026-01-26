"use client";

import { motion } from "framer-motion";

/**
 * n8n-style Lightning Grid Animation
 * Elite visual representation of AI processing flow
 */
export function LightningGrid() {
    const lightningPath = "M 50 150 L 120 80 L 180 140 L 250 60 L 320 120 L 390 40";
    
    const nodeVariants = {
        initial: { scale: 0, opacity: 0 },
        animate: (i: number) => ({
            scale: 1,
            opacity: 1,
            transition: {
                delay: i * 0.15,
                duration: 0.4,
                ease: "easeOut" as const
            }
        })
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
            <svg 
                className="w-full h-full" 
                viewBox="0 0 450 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                {/* Base path - subtle */}
                <path 
                    d={lightningPath}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="text-border"
                />
                
                {/* Animated lightning bolt */}
                <motion.path
                    d={lightningPath}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                        pathLength: 1, 
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        pathLength: { duration: 2, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="text-foreground"
                />

                {/* Nodes with pulse animation */}
                {[
                    { x: 50, y: 150 },
                    { x: 120, y: 80 },
                    { x: 180, y: 140 },
                    { x: 250, y: 60 },
                    { x: 320, y: 120 },
                    { x: 390, y: 40 }
                ].map((node, i) => (
                    <g key={i}>
                        {/* Outer pulse ring */}
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="8"
                            fill="currentColor"
                            className="text-foreground/20"
                            variants={pulseVariants}
                            animate="animate"
                            custom={i}
                        />
                        {/* Core node */}
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="4"
                            fill="currentColor"
                            className="text-foreground"
                            variants={nodeVariants}
                            initial="initial"
                            animate="animate"
                            custom={i}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
