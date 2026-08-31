import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export function getLanguageModel(): LanguageModel | null {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const customModel = process.env.AI_MODEL;

  // 1. Google Gemini (Google AI Studio Key)
  if (geminiKey && geminiKey.trim()) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey.trim() });
    return google(customModel || "gemini-1.5-flash");
  }

  // 2. OpenAI / OpenRouter / DeepSeek / Groq (OpenAI-compatible)
  if (openaiKey && openaiKey.trim()) {
    const openai = createOpenAI({
      apiKey: openaiKey.trim(),
      baseURL: baseUrl || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined),
    });
    return openai(customModel || "gpt-4o-mini");
  }

  return null;
}
