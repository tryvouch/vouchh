"use node";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Elite AI Review Processing Action
 * Uses Gemini 1.5 Flash to filter spam and flag negative reviews
 * Returns sentiment analysis with reasoning
 */
export const processReview = action({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.runQuery(internal.reviews.getById, { id: args.reviewId });
    if (!review) throw new Error("Review not found");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing - skipping AI processing");
      // Default to visible but unclassified
      await ctx.runMutation(internal.reviews.updateSentiment, {
        id: args.reviewId,
        sentiment: "Questionable",
      });
      return { sentiment: "Questionable", isSpam: false, isNegative: false };
    }

    // Enhanced prompt for better classification
    const prompt = `You are an AI assistant analyzing customer reviews for a business reputation platform.

Analyze this review and classify it into exactly ONE category:

1. "Positive" - Genuine positive feedback, satisfied customer, helpful review
2. "Questionable" - Mixed feedback, neutral, mild complaints, or unclear intent
3. "Spam" - Bot-generated, irrelevant, abusive, promotional spam, or fake review

Review content: "${review.content}"
Rating: ${review.rating}/5
Author: ${review.author}

Rules:
- If rating is 4-5 stars and content is positive → "Positive"
- If rating is 1-2 stars and content is negative → "Questionable" (not spam, just negative)
- If content is clearly spam, bot-like, or irrelevant → "Spam"
- If content is mixed or neutral → "Questionable"

Respond with ONLY the category name: "Positive", "Questionable", or "Spam".`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3, // Lower temperature for more consistent classification
              maxOutputTokens: 10,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Validate and normalize response
      const valid = ["Positive", "Questionable", "Spam"];
      const sentiment = valid.includes(text) ? text : "Questionable";

      // Determine visibility: Positive and Questionable are visible by default, Spam is hidden
      const isVisible = sentiment !== "Spam";
      const isSpam = sentiment === "Spam";
      const isNegative = sentiment === "Questionable" && review.rating <= 2;

      // Update review with sentiment and visibility
      await ctx.runMutation(internal.reviews.updateSentimentAndVisibility, {
        id: args.reviewId,
        sentiment: sentiment as "Positive" | "Questionable" | "Spam",
        isVisible,
      });

      return { 
        sentiment, 
        isSpam, 
        isNegative,
        isVisible 
      };

    } catch (e) {
      console.error("Error processing review with Gemini:", e);
      // Fallback: mark as Questionable and visible
      await ctx.runMutation(internal.reviews.updateSentimentAndVisibility, {
        id: args.reviewId,
        sentiment: "Questionable",
        isVisible: true,
      });
      return { 
        sentiment: "Questionable", 
        isSpam: false, 
        isNegative: false,
        isVisible: true 
      };
    }
  },
});
