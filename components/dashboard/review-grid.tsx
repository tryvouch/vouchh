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
    sentiment: "positive" | "neutral" | "negative" | null;
    isVisible: boolean;
    createdAt: number;
}

interface ReviewGridProps {
    reviews: Review[];
}

const sentimentStyles = {
    positive: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    neutral: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    negative: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

const sentimentLabels = {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Flagged",
};

export function ReviewGrid({ reviews }: ReviewGridProps) {
    const toggleVisibility = useMutation(api.reviews.toggleVisibility);

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Connect your Google Business or Yelp account to start syncing reviews.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review, index) => (
                <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`border border-border rounded-xl p-5 bg-card/50 ${!review.isVisible ? "opacity-50" : ""}`}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                {review.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{review.author}</div>
                                <div className="flex items-center gap-0.5 mt-0.5">
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
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {review.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                        {review.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.sentiment && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${sentimentStyles[review.sentiment]}`}>
                                {sentimentLabels[review.sentiment]}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
