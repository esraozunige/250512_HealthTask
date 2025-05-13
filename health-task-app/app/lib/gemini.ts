import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyB6RhZ_wzCr0_i0QyDDYQtPmtWabw8cNpU"; // Your API key
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function rewriteWithGemini(text: string): Promise<string> {
    const prompt = `Rewrite the following text to make it clearer, make it short and concise, more engaging, and positive. Create only one sentence. Keep the meaning, but 
    improve the style.\n\nText: "${text}"`; // TODO: change the prompt if necessary
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const rewritten = await result.response.text();
    if (!rewritten) throw new Error("No rewrite returned");
    return rewritten.trim();
  } catch (err) {
    console.error("Gemini rewrite error:", err);
    throw err;
  }
}

export async function screenSecretWithGemini(secret: string): Promise<boolean> {
  const prompt = `Is the following text a valid, private, and sensitive secret (not trivial, not generic, not illegal, not something like "I don't like white")? Answer only YES or NO.\nSecret: "${secret}"`;
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const answer = (await result.response.text()).trim().toUpperCase();
    return answer.startsWith("YES");
  } catch (err) {
    console.error("Gemini secret screening error:", err);
    throw err;
  }
}