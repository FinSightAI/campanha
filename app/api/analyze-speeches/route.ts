import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 5, 60)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { speeches } = await req.json();
  if (!speeches || typeof speeches !== "string" || speeches.trim().length < 50) {
    return NextResponse.json({ error: "Missing speeches" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Serviço de IA indisponível. Contate o suporte." }, { status: 503 });

  const prompt = `You are a political speechwriting expert. Analyze these speeches written by a specific politician and extract their unique voice fingerprint.

Speeches to analyze:
${speeches.substring(0, 8000)}

Return a concise style profile (max 250 words) covering:
1. Tone and register (formal/warm/direct/emotional?)
2. Recurring rhetorical patterns and devices
3. How they open and close speeches
4. Key values and themes they emphasize
5. Vocabulary characteristics (simple/complex? local references?)
6. How they address the audience

Write in English, regardless of the speech language. Be specific — a speechwriter must be able to replicate this voice from your analysis.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return NextResponse.json({ analysis: result.response.text().trim() });
  } catch (e) {
    console.error("[analyze-speeches]", e);
    return NextResponse.json(
      { error: "Erro ao analisar. Tente novamente." },
      { status: 500 }
    );
  }
}
