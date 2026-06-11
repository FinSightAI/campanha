import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const TONE_MAP: Record<string, string> = {
  formal: "formal, authoritative, and professional",
  warm: "warm, empathetic, and personally relatable",
  urgent: "urgent, passionate, and action-oriented",
  chat: "conversational, casual, and approachable",
};

const LENGTH_MAP: Record<string, { words: number; label: string }> = {
  short: { words: 60, label: "30 seconds" },
  med: { words: 130, label: "1 minute" },
  long: { words: 260, label: "2 minutes" },
};

export async function POST(req: Request) {
  const { topic, audience, area, lang, tone = "warm", length = "med" } = await req.json();
  if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const langLabel = lang === "he" ? "Hebrew" : lang === "pt" ? "Brazilian Portuguese" : "English";
  const audienceStr = audience ? ` The audience is: ${audience}.` : "";
  const areaStr = area ? ` The speech is for the ${area} area/city.` : "";
  const toneDesc = TONE_MAP[tone] ?? TONE_MAP.warm;
  const { words, label } = LENGTH_MAP[length] ?? LENGTH_MAP.med;

  const prompt = `You are a political campaign speechwriter. Write a natural, persuasive speech that sounds like the candidate is speaking directly to the audience.

Tone: ${toneDesc}. Keep it exactly ${label} when spoken aloud (~${words} words).
Use first person. No bullet points — flowing paragraphs only.
Return ONLY the speech text, nothing else.

Write a ${langLabel} political campaign speech about: "${topic}".${areaStr}${audienceStr}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return NextResponse.json({ script: text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI error" },
      { status: 500 }
    );
  }
}
