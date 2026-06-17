import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { checkVideoQuota, incrementVideoQuota } from "@/lib/quota";

// Microsoft pt-BR TTS voices usable as a fallback when the avatar has no cloned
// (ElevenLabs) voice. Default is MALE — a silent female default reads as broken.
const ALLOWED_MS_VOICES = ["pt-BR-AntonioNeural", "pt-BR-FranciscaNeural", "pt-BR-MacerioMultilingualNeural"];
const DEFAULT_MS_VOICE = process.env.CAMPANHA_DEFAULT_VOICE || "pt-BR-AntonioNeural";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 5, 60)) return Response.json({ error: "Too many requests" }, { status: 429 });

  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "").replace(/\s+/g, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY not configured" }, { status: 500 });

  const { script, avatarId, voiceId, bgUrl, msVoice } = await req.json();

  if (typeof script !== "string" || typeof avatarId !== "string" || !script.trim() || !avatarId.trim()) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }
  if (script.length > 6000) {
    return Response.json({ error: "Script too long" }, { status: 400 });
  }
  if (voiceId != null && typeof voiceId !== "string") {
    return Response.json({ error: "Invalid voiceId" }, { status: 400 });
  }

  // Monthly plan quota (keyed to the billed D-ID account). Block before spending.
  const quota = await checkVideoQuota(apiKey);
  if (!quota.allowed) {
    return Response.json(
      {
        error: "Limite de vídeos do seu plano atingido neste mês. Fale com o suporte para ampliar.",
        code: "quota_exceeded",
        used: quota.used,
        limit: quota.limit,
      },
      { status: 402 }
    );
  }

  const body: Record<string, unknown> = {
    avatar_id: avatarId,
    script: {
      type: "text",
      input: script,
      provider: voiceId
        ? { type: "elevenlabs", voice_id: voiceId }
        : { type: "microsoft", voice_id: ALLOWED_MS_VOICES.includes(msVoice) ? msVoice : DEFAULT_MS_VOICE },
    },
  };

  if (bgUrl && bgUrl.trim()) {
    try {
      const u = new URL(bgUrl.trim());
      if (u.protocol === "https:") body.background = { source_url: u.href };
    } catch { /* invalid URL — skip background */ }
  }

  const res = await fetch("https://api.d-id.com/scenes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[generate]", res.status, data?.message || data?.error);
    return Response.json(
      { error: "Erro ao gerar o vídeo. Tente novamente." },
      { status: res.status }
    );
  }

  // Count only billed (successful) generations.
  const after = await incrementVideoQuota(apiKey);
  return Response.json({ id: data.id, remaining: after.remaining, limit: after.limit });
}
