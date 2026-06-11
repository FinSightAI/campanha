import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { script, lang } = await req.json();
  if (!script) return NextResponse.json({ error: "Missing script" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const langLabel = lang === "he" ? "Hebrew" : lang === "pt" ? "Brazilian Portuguese" : "English";
  const replyLang = lang === "pt" ? "Brazilian Portuguese" : lang === "he" ? "Hebrew" : "English";

  const prompt = `You are a political communication expert. Analyze this ${langLabel} political campaign speech and give constructive feedback.

Speech:
"""
${script}
"""

Respond in ${replyLang}. Return ONLY valid JSON — no markdown, no extra text:
{
  "strengths": ["max 2 specific strengths"],
  "weaknesses": ["max 2 specific improvements needed"],
  "suggestion": "one concrete, actionable sentence to improve this speech"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 500 });
  }
}
