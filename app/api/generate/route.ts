import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-did-key") || process.env.DID_API_KEY;
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { script, avatarId, voiceId } = await req.json();

  if (!script || !avatarId) {
    return Response.json({ error: "חסרים פרמטרים" }, { status: 400 });
  }

  const body = {
    avatar_id: avatarId,
    script: {
      type: "text",
      input: script,
      provider: voiceId
        ? { type: "elevenlabs", voice_id: voiceId }
        : { type: "microsoft", voice_id: "he-IL-AvriNeural" },
    },
  };

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
    return Response.json(
      { error: data.message || data.error || "שגיאה ב-D-ID" },
      { status: res.status }
    );
  }

  return Response.json({ id: data.id });
}
