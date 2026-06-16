import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Instant Voice Cloning via ElevenLabs. The candidate uploads ~1–2 min of clean
// audio of himself; we create an IVC voice and return its voice_id, which the
// generate route sends to D-ID as the elevenlabs provider voice so the video
// sounds like him. Requires ELEVENLABS_API_KEY, and the same ElevenLabs account
// must be connected inside D-ID (Pro+) for the voice_id to be usable there.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`clone-voice:${ip}`, 5, 60)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Prefer the user's own ElevenLabs key (so cloning is billed to their account);
  // fall back to the server key if configured.
  const elKey = req.headers.get("x-elevenlabs-key")?.trim() || process.env.ELEVENLABS_API_KEY;
  if (!elKey) {
    return Response.json({ error: "Clonagem de voz não configurada. Adicione sua chave ElevenLabs nas Configurações." }, { status: 503 });
  }

  const { audioUrl, name } = await req.json();
  if (typeof audioUrl !== "string" || !audioUrl.trim()) {
    return Response.json({ error: "Missing audioUrl" }, { status: 400 });
  }
  let parsed: URL;
  try { parsed = new URL(audioUrl); } catch { return Response.json({ error: "Invalid audioUrl" }, { status: 400 }); }
  if (parsed.protocol !== "https:") {
    return Response.json({ error: "Invalid audioUrl" }, { status: 400 });
  }

  // Pull the uploaded sample and forward it to ElevenLabs as multipart.
  let audioBlob: Blob;
  try {
    const r = await fetch(parsed.href);
    if (!r.ok) throw new Error("fetch failed");
    audioBlob = await r.blob();
    if (audioBlob.size > 25 * 1024 * 1024) {
      return Response.json({ error: "Áudio muito grande (máx. 25MB)." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Não foi possível ler o áudio." }, { status: 400 });
  }

  const form = new FormData();
  form.append("name", (typeof name === "string" && name.trim() ? name.trim() : "Campanha").slice(0, 60));
  form.append("files", audioBlob, "sample.mp3");

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": elKey },
      body: form,
    });
    const data = await res.json();
    if (!res.ok || !data.voice_id) {
      console.error("[clone-voice]", res.status, data);
      return Response.json({ error: "Falha ao clonar a voz. Tente novamente." }, { status: 502 });
    }
    return Response.json({ voiceId: data.voice_id });
  } catch (e) {
    console.error("[clone-voice]", e);
    return Response.json({ error: "Falha ao clonar a voz. Tente novamente." }, { status: 502 });
  }
}
