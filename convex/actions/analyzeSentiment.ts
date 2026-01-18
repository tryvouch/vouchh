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

    const prompt = `Analyze this review for a business. 
    You must output strictly valid JSON in the following format:
    {
      "sentiment": "Positive" | "Questionable" | "Spam",
      "score": number (0-100),
      "summary": string (max 10 words)
    }
    
    Review: "${review.content}"
    
    Respond with ONLY the JSON object. Do not include markdown formatting or backticks.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                response_mime_type: "application/json"
            }
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      // Strict JSON Parsing with Safety Fallback
      let result;
      try {
          // Remove any potential markdown code blocks if the model ignores instruction
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          result = JSON.parse(cleanText);
      } catch (e) {
          console.error("AI Hallucination - Invalid JSON:", text);
          // Fallback to basic sentiment logic if AI fails
          result = { 
              sentiment: "Questionable", 
              score: 50, 
              summary: "AI parsing failed, flagged for review." 
          };
      }

      // Validate schema compliance
      const validSentiments = ["Positive", "Questionable", "Spam"];
      const sentiment = validSentiments.includes(result.sentiment) ? result.sentiment : "Questionable";

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
