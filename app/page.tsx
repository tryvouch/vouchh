"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LightningGrid } from "@/components/hero/lightning-grid";
import { FloatingComposition } from "@/components/hero/floating-composition";

// Elite Animation Variants - Mathematical Precision
const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Elite Navigation - Sharp edges, mathematical spacing */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/90 backdrop-blur-[20px]">
                <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-xl tracking-[-0.02em] elite-kerning">Vouch</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <Link href="/sign-in">
                            <Button variant="ghost" className="font-medium tracking-tight">Log in</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="font-medium bg-foreground text-background hover:opacity-90 transition-opacity tracking-tight">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Elite Typography */}
            <section className="pt-40 pb-32 px-8 max-w-[1400px] mx-auto">
                <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="text-center space-y-12 mb-24"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-secondary/50 text-secondary-foreground text-sm font-medium tracking-tight">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Elite Reputation Platform
                    </motion.div>

                    <motion.h1 
                        variants={fadeInUp} 
                        className="text-7xl md:text-8xl font-bold tracking-[-0.04em] leading-[0.95] elite-kerning max-w-5xl mx-auto"
                    >
                        Automate Trust.<br />
                        Scale Conversion.
                    </motion.h1>

                    <motion.p 
                        variants={fadeInUp} 
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed tracking-tight"
                    >
                        AI-native social proof platform. Filter spam, highlight wins, broadcast trust—instantly.
                    </motion.p>

                    <motion.div 
                        variants={fadeInUp} 
                        className="flex flex-wrap items-center justify-center gap-6"
                    >
                        <Link href="/sign-up">
                            <Button 
                                size="lg" 
                                className="h-14 px-10 text-base bg-foreground text-background hover:opacity-90 transition-opacity tracking-tight font-medium"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2.5 h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="text-sm text-muted-foreground tracking-tight">
                            <span className="font-medium text-foreground">7 Days Free.</span> No credit card required.
                        </div>
                    </motion.div>
                </motion.div>

                {/* Asymmetric Bento Grid - Elite Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[600px]"
                >
                    {/* Feature 1: AI Sentiment Analysis - Large (n8n-style lightning) */}
                    <motion.div 
                        className="col-span-12 md:col-span-7 glass-panel relative overflow-hidden group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                            <div>
                                <div className="inline-flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-foreground" />
                                    </div>
                                    <h3 className="text-3xl font-bold tracking-tight elite-kerning">AI Sentiment Analysis</h3>
                                </div>
                                <p className="text-muted-foreground text-lg max-w-md leading-relaxed tracking-tight">
                                    Gemini 1.5 Flash processes every review in real-time. Classifies as Positive, Questionable, or Spam before it reaches your site.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span>Processing 24/7</span>
                            </div>
                        </div>
                        {/* n8n-style Lightning Animation */}
                        <LightningGrid />
                    </motion.div>

                    {/* Feature 2: Multi-source Sync - Medium (Shopify-style floating) */}
                    <motion.div 
                        className="col-span-12 md:col-span-5 glass-panel relative overflow-hidden group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                            <div>
                                <div className="inline-flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center">
                                        <Layers className="w-6 h-6 text-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight elite-kerning">Multi-source Sync</h3>
                                </div>
                                <p className="text-muted-foreground text-base max-w-sm leading-relaxed tracking-tight">
                                    Connect Google, Yelp, and manual reviews. Unified feed, instant updates.
                                </p>
                            </div>
                        </div>
                        {/* Shopify-style Floating Composition */}
                        <FloatingComposition />
                    </motion.div>

                    {/* Feature 3: Zero Latency - Small */}
                    <motion.div 
                        className="col-span-12 md:col-span-4 glass-panel p-10 flex flex-col justify-between group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <div className="w-12 h-12 bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight elite-kerning mb-4">Zero Latency</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed tracking-tight">
                                Edge-optimized widgets. Loads instantly without impacting your LCP.
                            </p>
                        </div>
                        <div className="text-4xl font-bold font-mono tracking-tight">0ms</div>
                    </motion.div>

                    {/* Feature 4: Conversion Lift - Small */}
                    <motion.div 
                        className="col-span-12 md:col-span-4 glass-panel p-10 flex flex-col justify-between group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <div className="w-12 h-12 bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mb-6">
                                <ArrowRight className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight elite-kerning mb-4">Conversion Lift</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed tracking-tight">
                                Measurable trust signals. Average +24% checkout completion.
                            </p>
                        </div>
                        <div className="text-4xl font-bold font-mono tracking-tight text-green-600 dark:text-green-400">+24%</div>
                    </motion.div>

                    {/* Feature 5: Trust Score - Small */}
                    <motion.div 
                        className="col-span-12 md:col-span-4 glass-panel p-10 flex flex-col justify-between group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <div className="w-12 h-12 bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight elite-kerning mb-4">Trust Score</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed tracking-tight">
                                Real-time reputation metric. Track your brand's trust level.
                            </p>
                        </div>
                        <div className="text-4xl font-bold font-mono tracking-tight">87</div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Elite Footer */}
            <footer className="py-16 border-t border-border mt-24 bg-card/50">
                <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between text-sm text-muted-foreground tracking-tight">
                    <div>© 2026 Vouch Inc. All rights reserved.</div>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
