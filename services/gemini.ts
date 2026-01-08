
import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

const API_KEY = process.env.API_KEY;

export const generateAIInsights = async (trades: Trade[]) => {
  if (!API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Format trade data for the prompt
  const tradeSummary = trades.map(t => ({
    symbol: t.symbol,
    type: t.type,
    pnl: t.pnl,
    setup: t.setup,
    notes: t.notes,
    date: t.date
  })).slice(0, 20); // Keep prompt length reasonable

  const prompt = `
    Act as a senior institutional hedge fund risk manager and performance psychologist.
    Analyze the following trading journal data and provide actionable feedback.
    
    Data: ${JSON.stringify(tradeSummary)}

    Focus on:
    1. Strategy efficacy: Which setups are working, which aren't?
    2. Psychological patterns: Based on the notes, point out potential biases (FOMO, Revenge Trading, over-leveraging).
    3. Recommendations: 3 specific steps to improve performance next week.
    
    Keep the tone professional, direct, and data-driven. Use Markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("AI Insight error:", error);
    throw error;
  }
};
