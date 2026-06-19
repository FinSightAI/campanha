import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { checkVideoQuota, incrementVideoQuota, estimateSeconds } from "@/lib/quota";
import { getVideoProvider } from "@/lib/videoProvider";
import { writeLog } from "@/lib/videoLog";

// Microsoft pt-BR TTS voices usable as a fallback when the avatar has no cloned
// (ElevenLabs) voice. Default is MALE — a silent female default reads as broken.
const ALLOWED_MS_VOICES = ["pt-BR-AntonioNeural", "pt-BR-FranciscaNeural", "pt-BR-MacerioMultilingualNeural"];
const DEFAULT_MS_VOICE = process.env.CAMPANHA_DEFAULT_VOICE || "pt-BR-AntonioNeural";

function quotaError(quota: Awaited<ReturnType<typeof checkVideoQuota>>) {
  const videoExceeded = quota.videos_used >= quota.videos_limit;
  const reason = videoExceeded
    ? `Limite de ${quota.videos_limit} vídeos por mês atingido.`
    : `Limite de ${Math.round(quota.seconds_limit / 60)} minutos por mês atingido (${Math.round(quota.seconds_used / 60)} min usados).`;
  return Response.json(
    {
      error: `${reason} Fale com o suporte para ampliar.`,
      code: "quota_exceeded",
      videos_used: quota.videos_used,
      videos_limit: quota.videos_limit,
      seconds_used: quota.seconds_used,
      seconds_limit: quota.seconds_limit,
    },
    { status: 402 }
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 5, 60)) return Response.json({ error: "Too many requests" }, { status: 429 });

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

  const estimatedSec = estimateSeconds(script);
  const provider = getVideoProvider();

  // ── HeyGen provider ─────────────────────────────────────────────────────────
  if (provider === "heygen") {
    const heygenKey = process.env.HEYGEN_API_KEY;
    if (!heygenKey) return Response.json({ error: "Serviço de vídeo não configurado." }, { status: 500 });

    const quotaKey = heygenKey.slice(0, 32);
    const quota = await checkVideoQuota(quotaKey, estimatedSec);
    if (!quota.allowed) return quotaError(quota);

    const videoInputs: Record<string, unknown>[] = [{
      character: {
        type: "avatar",
        avatar_id: avatarId.replace(/\s+/g, ""),
        avatar_style: "normal",
      },
      voice: voiceId && !voiceId.startsWith("http")
        ? { type: "text", input_text: script.trim(), voice_id: voiceId, speed: 1.0 }
        : {
            type: "text",
            input_text: script.trim(),
            voice_id: process.env.CAMPANHA_HEYGEN_DEFAULT_VOICE || "1bd001e7e50f421d891986aad5158bc8",
            speed: 1.0,
          },
    }];

    if (bgUrl && bgUrl.trim()) {
      try {
        const u = new URL(bgUrl.trim());
        if (u.protocol === "https:") {
          (videoInputs[0] as Record<string, unknown>).background = { type: "image", url: u.href };
        }
      } catch { /* invalid URL — skip */ }
    }

    const heyRes = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: { "X-Api-Key": heygenKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        video_inputs: videoInputs,
        dimension: { width: 1280, height: 720 },
        aspect_ratio: "16:9",
        test: false,
      }),
    });

    const heyData = await heyRes.json();
    if (!heyRes.ok) {
      console.error("[heygen generate]", heyRes.status, heyData?.message || heyData?.error);
      return Response.json({ error: "Erro ao gerar o vídeo. Tente novamente." }, { status: heyRes.status });
    }

    const heyVideoId = heyData?.data?.video_id;
    if (!heyVideoId) {
      console.error("[heygen generate] no video_id", heyData);
      void writeLog({ ts: new Date().toISOString(), success: false, provider: "heygen", estimatedSec, error: "no video_id", clientId: quotaKey.slice(0, 8) });
      return Response.json({ error: "Erro ao gerar o vídeo. Tente novamente." }, { status: 500 });
    }

    const after = await incrementVideoQuota(quotaKey, estimatedSec);
    void writeLog({ ts: new Date().toISOString(), success: true, provider: "heygen", estimatedSec, videoId: `heygen_${heyVideoId}`, clientId: quotaKey.slice(0, 8) });
    return Response.json({
      id: `heygen_${heyVideoId}`,
      remaining_videos: after.remaining_videos,
      remaining_seconds: after.remaining_seconds,
      videos_limit: after.videos_limit,
      seconds_limit: after.seconds_limit,
    });
  }

  // ── D-ID provider (default) ──────────────────────────────────────────────────
  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "").replace(/\s+/g, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY not configured" }, { status: 500 });

  const quota = await checkVideoQuota(apiKey, estimatedSec);
  if (!quota.allowed) return quotaError(quota);

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
    } catch { /* invalid URL — skip */ }
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
  const clientId = apiKey.slice(0, 8);
  if (!res.ok) {
    console.error("[generate]", res.status, data?.message || data?.error);
    void writeLog({ ts: new Date().toISOString(), success: false, provider: "did", estimatedSec, error: String(data?.message || data?.error || res.status), clientId });
    return Response.json({ error: "Erro ao gerar o vídeo. Tente novamente." }, { status: res.status });
  }

  const after = await incrementVideoQuota(apiKey, estimatedSec);
  void writeLog({ ts: new Date().toISOString(), success: true, provider: "did", estimatedSec, videoId: data.id, clientId });
  return Response.json({
    id: data.id,
    remaining_videos: after.remaining_videos,
    remaining_seconds: after.remaining_seconds,
    videos_limit: after.videos_limit,
    seconds_limit: after.seconds_limit,
  });
}
