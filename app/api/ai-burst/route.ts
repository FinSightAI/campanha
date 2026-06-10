import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const AUDIENCES = {
  he: ["צעירים (18–35)", "ותיקים (65+)", "הורים לילדים", "בעלי עסקים", "קהל כללי"],
  en: ["Young people (18–35)", "Seniors (65+)", "Parents with children", "Business owners", "General audience"],
  pt: ["Jovens (18–35)", "Idosos (65+)", "Pais com filhos", "Empresários", "Público geral"],
};

export async function POST(req: Request) {
  const { topic, area, lang } = await req.json();
  if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const langLabel = lang === "he" ? "Hebrew" : lang === "pt" ? "Brazilian Portuguese" : "English";
  const areaStr = area ? ` for ${area}` : "";
  const audiences = AUDIENCES[lang as keyof typeof AUDIENCES] || AUDIENCES.en;

  const prompt = `You are a political campaign speechwriter. Write 5 different campaign speeches about "${topic}"${areaStr} in ${langLabel}.

Each speech must be adapted for a specific audience:
1. ${audiences[0]}
2. ${audiences[1]}
3. ${audiences[2]}
4. ${audiences[3]}
5. ${audiences[4]}

Rules:
- Each speech is 45–60 seconds when spoken (~100–130 words)
- Natural, first-person, warm and direct
- Each speech must feel meaningfully different — use different vocabulary, examples, and emotional hooks for each audience
- No bullet points, flowing paragraphs

Return ONLY valid JSON with this exact structure:
{"variants":[{"audience":"...","script":"..."},{"audience":"...","script":"..."},{"audience":"...","script":"..."},{"audience":"...","script":"..."},{"audience":"...","script":"..."}]}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI error" },
      { status: 500 }
    );
  }
}
