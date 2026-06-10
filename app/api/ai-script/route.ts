import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM = `You are a political campaign speechwriter. Write a natural, persuasive speech that sounds like the candidate is speaking directly to the audience.
Keep it 45–60 seconds when spoken aloud (about 100–130 words).
Use first person. Be warm, specific, and action-oriented. No bullet points — flowing paragraphs only.
Return ONLY the speech text, nothing else.`;

export async function POST(req: Request) {
  const { topic, audience, area, lang } = await req.json();
  if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const langLabel = lang === "he" ? "Hebrew" : lang === "pt" ? "Brazilian Portuguese" : "English";
  const audienceStr = audience ? ` The audience is: ${audience}.` : "";
  const areaStr = area ? ` The speech is for the ${area} area/city.` : "";

  const prompt = `${SYSTEM}

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
