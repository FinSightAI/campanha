import { list, put } from "@vercel/blob";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Public watch page for a shared campaign video. Replaces the old bare redirect
// so that every shared link carries a prominent, explicit AI-content label —
// required by TSE rules for synthetic electoral content (Res. 23.610/2019).
export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !/^[a-f0-9]{6,32}$/i.test(id)) redirect("/");

  let videoUrl = "";
  try {
    const { blobs } = await list({ prefix: `tracks/${id}.json`, token });
    const blob = blobs.find((b) => b.pathname === `tracks/${id}.json`);
    if (!blob) throw new Error("not found"); // falls through to redirect below

    const data = await fetch(blob.url, { cache: "no-store" }).then((r) => r.json());
    const parsed = new URL(data.videoUrl);
    if (parsed.protocol === "https:") {
      videoUrl = parsed.href;
      // Best-effort view count (non-atomic; acceptable for pilot analytics).
      const updated = JSON.stringify({ ...data, count: (data.count ?? 0) + 1 });
      await put(`tracks/${id}.json`, updated, {
        access: "public",
        addRandomSuffix: false,
        token,
        contentType: "application/json",
      });
    }
  } catch {
    videoUrl = "";
  }

  if (!videoUrl) redirect("/");

  const src = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;

  return (
    <main
      lang="pt-BR"
      style={{
        minHeight: "100vh",
        background: "#09090f",
        color: "#f0f0f0",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640, marginTop: 24 }}>
        {/* Prominent, always-visible AI-content disclosure (TSE requirement) */}
        <div
          role="note"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#1a1405",
            border: "1px solid #c9a84c",
            color: "#f0c040",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 12,
            lineHeight: 1.35,
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>
            Conteúdo gerado por inteligência artificial (avatar digital · tecnologia D-ID).
          </span>
        </div>

        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", border: "1px solid #252538" }}>
          <video src={src} controls playsInline autoPlay style={{ width: "100%", display: "block" }} />
          {/* Watermark burned over the player, visible during playback */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(0,0,0,.6)",
              color: "#f0c040",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 6,
              pointerEvents: "none",
              letterSpacing: ".02em",
            }}
          >
            ⚠️ IA · conteúdo sintético
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#6b6b8a", marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>
          Este vídeo foi criado com inteligência artificial. A divulgação de conteúdo
          sintético em propaganda eleitoral é regida pelas normas do TSE.
        </p>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ color: "#c9a84c", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Campanha
          </a>
        </div>
      </div>
    </main>
  );
}
