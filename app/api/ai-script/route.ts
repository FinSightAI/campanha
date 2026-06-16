import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 20, 60)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { topic, audience, area, lang, tone = "warm", length = "med", personalContext } = await req.json();
  if (typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }
  // Bound all free-text inputs — they are concatenated into the prompt, so
  // cap length (cost) and reject non-strings (injection via objects/arrays).
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const topicSafe = topic.slice(0, 300);
  const audienceSafe = str(audience, 200);
  const areaSafe = str(area, 100);
  const personalContextSafe = str(personalContext, 2000);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Serviço de IA indisponível. Contate o suporte." }, { status: 503 });

  const langLabel = lang === "he" ? "Hebrew" : lang === "pt" ? "Brazilian Portuguese" : "English";
  const audienceStr = audienceSafe ? ` The audience is: ${audienceSafe}.` : "";
  const areaStr = areaSafe ? ` The speech is for the ${areaSafe} area/city.` : "";
  const toneDesc = TONE_MAP[tone] ?? TONE_MAP.warm;
  const { words, label } = LENGTH_MAP[length] ?? LENGTH_MAP.med;

  const contextStr = personalContextSafe
    ? `\n\nIMPORTANT — this speech must sound authentically like THIS specific candidate:\n${personalContextSafe}\nAdapt vocabulary, references, and style to match the candidate's profile above.`
    : "";

  const prompt = `You are a political campaign speechwriter. Write a natural, persuasive speech that sounds like the candidate is speaking directly to the audience.

Tone: ${toneDesc}. Keep it exactly ${label} when spoken aloud (~${words} words).
Use first person. No bullet points — flowing paragraphs only.
Return ONLY the speech text, nothing else.

Write a ${langLabel} political campaign speech about: "${topicSafe}".${areaStr}${audienceStr}${contextStr}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return NextResponse.json({ script: text });
  } catch (e) {
    console.error("[ai-script]", e);
    return NextResponse.json(
      { error: "Erro ao gerar o texto. Tente novamente." },
      { status: 500 }
    );
  }
}
