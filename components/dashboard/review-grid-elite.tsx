"use client";

import { motion } from "framer-motion";
import { Star, Eye, EyeOff } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Review {
    _id: Id<"reviews">;
    author: string;
    rating: number;
    content: string;
    sentiment: "Positive" | "Questionable" | "Spam" | null;
    isVisible: boolean;
    createdAt: number;
}

interface ReviewGridProps {
    reviews: Review[];
}

const sentimentStyles = {
    Positive: "bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50",
    Questionable: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50",
    Spam: "bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50",
};

const sentimentLabels = {
    Positive: "Positive",
    Questionable: "Questionable",
    Spam: "Spam",
};

export function ReviewGrid({ reviews }: ReviewGridProps) {
    const toggleVisibility = useMutation(api.reviews.toggleVisibility);

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-secondary flex items-center justify-center mb-6">
                    <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold tracking-tight elite-kerning mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm tracking-tight">
                    Connect your Google Business or Yelp account to start syncing reviews.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
                <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`border border-border bg-card/50 p-6 relative ${!review.isVisible ? "opacity-50" : ""}`}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center font-bold text-sm elite-mono">
                                {review.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold text-sm tracking-tight">{review.author}</div>
                                <div className="flex items-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleVisibility({ id: review._id })}
                            className="p-2 hover:bg-secondary transition-colors"
                            aria-label={review.isVisible ? "Hide review" : "Show review"}
                        >
                            {review.isVisible ? (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-4 tracking-tight">
                        {review.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-xs text-muted-foreground elite-mono">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            })}
                        </span>
                        {review.sentiment && (
                            <span className={`text-xs px-2.5 py-1 border tracking-tight ${sentimentStyles[review.sentiment]}`}>
                                {sentimentLabels[review.sentiment]}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
