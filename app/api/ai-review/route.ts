import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 20, 60)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { script, lang } = await req.json();
  if (!script) return NextResponse.json({ error: "Missing script" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Serviço de IA indisponível. Contate o suporte." }, { status: 503 });

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
