"use node";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const analyzeReview = action({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args): Promise<{ sentiment: "Positive" | "Questionable" | "Spam" | null }> => {
    const review = await ctx.runQuery(internal.reviews.getById, { id: args.reviewId });
    if (!review) throw new Error("Review not found");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing");
      return { sentiment: null };
    }

    const prompt = `Analyze this review for a business. Categorize it into exactly one of these three buckets:
    
1. "Positive" (Good feedback, happy customer)
2. "Questionable" (Mixed, confusing, or mild complaint)
3. "Spam" (Irrelevant, bot-like, or abusive)

Review: "${review.content}"

Respond with ONLY the category name.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim(); // "Positive"

      // Validate
      const valid = ["Positive", "Questionable", "Spam"];
      const sentiment = valid.includes(text) ? text : "Questionable";

      await ctx.runMutation(internal.reviews.updateSentiment, {
        id: args.reviewId,
        sentiment: sentiment as "Positive" | "Questionable" | "Spam",
      });

      return { sentiment };

    } catch (e) {
      console.error(e);
      return { sentiment: null };
    }
  },
});
