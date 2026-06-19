"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { useLanguage } from "@/lib/LanguageContext";
import { getAppHeaders } from "@/lib/didKey";

type VideoEntry = { id: string; url: string; script: string; name?: string; trackId?: string; createdAt: string };

const CSS = `
  .vid-card { transition: transform .18s ease, box-shadow .18s ease; }
  .vid-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.25); }
  .play-btn { transition: transform .15s ease, opacity .15s ease; }
  .vid-thumb:hover .play-btn { transform: scale(1.1); }
`;

// ─── Video Trimmer ────────────────────────────────────────────────────────────

function VideoTrimmer({ video, onClose, onSaved, lang, t }: {
  video: VideoEntry;
  onClose: () => void;
  onSaved: (url: string, name: string) => void;
  lang: string;
  t: (k: string) => string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [trimming, setTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const supported = typeof document !== "undefined" && (
    "captureStream" in document.createElement("video") ||
    "mozCaptureStream" in document.createElement("video")
  );

  // Stream cross-origin (Blob / D-ID) media through a same-origin proxy so the
  // element is CORS-clean — otherwise playback and captureStream() both fail.
  const playUrl = /^https:\/\//.test(video.url)
    ? `/api/proxy-video?url=${encodeURIComponent(video.url)}`
    : video.url;

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }

  function onLoaded() {
    const d = videoRef.current?.duration || 0;
    setDuration(d);
    setEndTime(d);
  }

  async function exportTrim() {
    const vid = videoRef.current;
    if (!vid || !supported) { setError(t("vid_trim_unsupported")); return; }
    setTrimming(true);
    setProgress(0);
    setError("");

    const stream = ("captureStream" in vid)
      ? (vid as HTMLVideoElement & { captureStream(): MediaStream }).captureStream()
      : (vid as HTMLVideoElement & { mozCaptureStream(): MediaStream }).mozCaptureStream();

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "";

    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      await new Promise<void>((resolve, reject) => {
        // Watchdog: real-time capture should take ~(end-start)s; if seeking
        // never resolves or playback stalls, bail instead of hanging forever.
        const watchdog = setTimeout(() => {
          try { vid.pause(); recorder.stop(); } catch { /* noop */ }
          reject(new Error("timeout"));
        }, (endTime - startTime) * 1500 + 8000);

        recorder.onstop = () => { clearTimeout(watchdog); resolve(); };
        recorder.onerror = () => { clearTimeout(watchdog); reject(new Error("Recorder error")); };

        vid.currentTime = startTime;
        vid.onseeked = () => {
          recorder.start(100);
          vid.play();
          const interval = setInterval(() => {
            const elapsed = vid.currentTime - startTime;
            const total = endTime - startTime;
            setProgress(Math.min(elapsed / total, 0.99));
            if (vid.currentTime >= endTime - 0.1) {
              clearInterval(interval);
              vid.pause();
              recorder.stop();
            }
          }, 100);
        };
      });

      setProgress(1);
      const effectiveMime = recorder.mimeType || "video/webm";
      const ext = effectiveMime.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunks, { type: effectiveMime });
      const file = new File([blob], `trim-${Date.now()}.${ext}`, { type: effectiveMime });
      const result = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      onSaved(result.url, (video.name || video.script.split(" ").slice(0, 4).join(" ")) + " (recorte)");
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setTrimming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.8)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-bold text-sm" style={{ color: "var(--gold)" }}>✂️ {t("vid_trim")}</p>
          <button onClick={onClose} aria-label="Fechar" className="p-2" style={{ color: "var(--muted)" }}>✕</button>
        </div>

        <div className="p-5">
          <video ref={videoRef} src={playUrl} onLoadedMetadata={onLoaded}
            className="w-full rounded-xl mb-5" style={{ maxHeight: 220, background: "#000" }}
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.currentTime >= endTime) {
                videoRef.current.pause();
                videoRef.current.currentTime = startTime;
              }
            }}
          />

          {!supported && (
            <p className="text-xs mb-4 text-center" style={{ color: "#e55" }}>{t("vid_trim_unsupported")}</p>
          )}

          {duration > 0 && supported && (
            <>
              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                    <span>{t("vid_trim_start")}</span><span className="font-mono" style={{ color: "var(--gold)" }}>{fmt(startTime)}</span>
                  </div>
                  <input type="range" min={0} max={duration} step={0.1} value={startTime}
                    onChange={(e) => { const v = +e.target.value; setStartTime(Math.min(v, endTime - 0.5)); if (videoRef.current) videoRef.current.currentTime = v; }}
                    className="w-full" style={{ accentColor: "var(--gold)" }} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                    <span>{t("vid_trim_end")}</span><span className="font-mono" style={{ color: "var(--gold)" }}>{fmt(endTime)}</span>
                  </div>
                  <input type="range" min={0} max={duration} step={0.1} value={endTime}
                    onChange={(e) => { const v = +e.target.value; setEndTime(Math.max(v, startTime + 0.5)); if (videoRef.current) videoRef.current.currentTime = v; }}
                    className="w-full" style={{ accentColor: "var(--gold)" }} />
                </div>
              </div>

              <p className="text-xs text-center mb-4" style={{ color: "var(--muted)" }}>
                {lang === "pt" ? `Duração: ${fmt(endTime - startTime)}` : `Duration: ${fmt(endTime - startTime)}`}
              </p>

              {trimming && (
                <div className="mb-4">
                  <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "var(--gold)" }} />
                  </div>
                  <p className="text-xs text-center" style={{ color: "var(--muted)" }}>{t("vid_trim_exporting")} {Math.round(progress * 100)}%</p>
                </div>
              )}

              {error && <p className="text-xs mb-3 text-center" style={{ color: "#e55" }}>{error}</p>}

              {saved ? (
                <p className="text-sm font-bold text-center" style={{ color: "var(--gold)" }}>{t("vid_trim_saved")}</p>
              ) : (
                <button onClick={exportTrim} disabled={trimming}
                  className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {trimming ? t("vid_trim_exporting") : t("vid_trim_export")}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function waMsg(name: string, url: string, lang: string) {
  if (lang === "en") return `Hi! I'm ${name} and I'd like to share my campaign message.\n\n🎥 ${url}\n\nYour voice matters — count on my support!`;
  return `Olá! Sou ${name} e quero compartilhar minha mensagem de campanha com você.\n\n🎥 ${url}\n\nJuntos, podemos fazer mais pela nossa cidade. Conte comigo!`;
}

export default function VideosPage() {
  const { t, lang } = useLanguage();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [avatarName, setAvatarName] = useState("");
  const [avatarThumb, setAvatarThumb] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [trimmingVideo, setTrimmingVideo] = useState<VideoEntry | null>(null);
  const [origin, setOrigin] = useState("");

  // Share through the labeled /v/<id> watch page when a tracking link exists,
  // so externally-shared content always carries the AI-content disclosure.
  const shareUrl = (v: VideoEntry) => (v.trackId && origin ? `${origin}/v/${v.trackId}` : v.url);

  useEffect(() => {
    setOrigin(window.location.origin);
    let vids: VideoEntry[] = [];
    try { vids = JSON.parse(localStorage.getItem("campanha_videos") || "[]"); } catch { vids = []; }
    setVideos(vids);
    setAvatarName(localStorage.getItem("campanha_avatar_name") || "");
    setAvatarThumb(localStorage.getItem("campanha_avatar_thumbnail") || "");
    // Fetch stats for videos with trackIds
    const ids = vids.map((v) => v.trackId).filter(Boolean) as string[];
    if (ids.length) {
      fetch(`/api/track?ids=${ids.join(",")}`, { headers: getAppHeaders() })
        .then((r) => r.json())
        .then((data) => setStats(data.stats || {}))
        .catch(() => {});
    }
  }, []);

  function remove(id: string) {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem("campanha_videos", JSON.stringify(updated));
    if (playing === id) setPlaying(null);
  }

  async function copyLink(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function startRename(v: VideoEntry) {
    setEditingId(v.id);
    setEditName(v.name || v.script.split(" ").slice(0, 5).join(" "));
  }

  function saveRename(id: string) {
    const updated = videos.map((v) => v.id === id ? { ...v, name: editName.trim() || v.name } : v);
    setVideos(updated);
    localStorage.setItem("campanha_videos", JSON.stringify(updated));
    setEditingId(null);
  }

  const dateLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "short" });
  };

  if (videos.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64 text-center">
        <p className="text-4xl mb-3">▶</p>
        <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{t("vid_empty_title")}</p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t("vid_empty_hint")}</p>
        <Link href="/create" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--gold)", color: "#000" }}>
          {t("vid_create")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="p-8" style={{ maxWidth: "min(88rem, 100%)", margin: "0 auto", width: "100%" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{t("vid_title")}</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{videos.length} {t("nav_videos").toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/analytics" className="px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}>
              📊 {t("nav_analytics")}
            </Link>
            <Link href="/create" className="px-4 py-2.5 rounded-lg text-sm font-bold" style={{ background: "var(--gold)", color: "#000" }}>
              + {t("vid_new")}
            </Link>
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }}>
          {videos.map((video) => {
            const views = video.trackId !== undefined ? (stats[video.trackId] ?? null) : null;
            const displayName = video.name || video.script.split(" ").slice(0, 5).join(" ");
            const link = shareUrl(video);
            const waUrl = `https://wa.me/?text=${encodeURIComponent(waMsg(avatarName, link, lang))}`;

            return (
              <div key={video.id} className="vid-card rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                {/* Thumbnail / player */}
                {playing === video.id ? (
                  <video src={video.url} controls autoPlay poster={avatarThumb || undefined} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="vid-thumb relative w-full flex items-center justify-center cursor-pointer"
                    style={{ aspectRatio: "16/9", background: avatarThumb ? `url(${avatarThumb}) center/cover` : "var(--bg)" }}
                    onClick={() => setPlaying(video.id)}>
                    <div style={{ position: "absolute", inset: 0, background: avatarThumb ? "rgba(0,0,0,.45)" : "repeating-linear-gradient(180deg,transparent 0,transparent 3px,rgba(255,255,255,.015) 3px,rgba(255,255,255,.015) 4px)", pointerEvents: "none" }} />
                    <button className="play-btn w-14 h-14 rounded-full flex items-center justify-center text-xl z-10" style={{ background: "var(--gold)", color: "#000" }}>▶</button>
                    {/* AI-content label */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold z-10"
                      style={{ background: "rgba(0,0,0,.65)", color: "#f0c040" }}>
                      ⚠️ {t("ai_label")}
                    </div>
                    {/* View badge */}
                    {views !== null && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(0,0,0,.65)", color: "var(--gold)" }}>
                        👁 {views}
                      </div>
                    )}
                  </div>
                )}

                {/* Name row */}
                <div className="px-3 pt-3 pb-1">
                  {editingId === video.id ? (
                    <div className="flex gap-1.5">
                      <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveRename(video.id); if (e.key === "Escape") setEditingId(null); }}
                        className="flex-1 px-2 py-1 rounded text-xs outline-none"
                        style={{ background: "var(--bg)", border: "1px solid var(--gold)", color: "var(--text)" }} />
                      <button onClick={() => saveRename(video.id)} className="text-xs px-2 py-1 rounded font-bold"
                        style={{ background: "var(--gold)", color: "#000" }}>✓</button>
                      <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 rounded"
                        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <p className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{displayName}</p>
                      <button onClick={() => startRename(video)} className="text-xs opacity-0 group-hover:opacity-60 transition-opacity"
                        style={{ color: "var(--muted)" }} title={t("vid_rename")}>✎</button>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-3 pb-3">
                  <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--muted)" }}>
                    {dateLabel(video.createdAt)}
                    {views !== null && <span className="ml-2">· {views} {t("analytics_views")}</span>}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={async () => {
                        const text = waMsg(avatarName, link, lang);
                        if (navigator.share) { try { await navigator.share({ text, url: link }); return; } catch { /* fallback */ } }
                        try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "var(--gold)", color: "#000" }}>
                      📤 {t("crt_share_native")}
                    </button>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "#25D366", color: "#fff" }}>
                      WA
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "#1877F2", color: "#fff" }}>
                      FB
                    </a>
                    <a href={video.url} download
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "var(--gold)", color: "#000" }}>
                      {t("vid_download")}
                    </a>
                    <button onClick={() => copyLink(video.id, link)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: copied === video.id ? "var(--gold)" : "var(--border)", color: copied === video.id ? "#000" : "var(--muted)" }}>
                      {copied === video.id ? "✓" : "🔗"}
                    </button>
                    <button onClick={() => setTrimmingVideo(video)} aria-label={t("vid_trim")}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", minWidth: 44 }}>
                      ✂️
                    </button>
                    <button onClick={() => remove(video.id)} aria-label={t("vid_delete")}
                      className="px-3 py-2 rounded-lg text-xs transition-opacity hover:opacity-70"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)", minWidth: 44 }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {trimmingVideo && (
        <VideoTrimmer
          video={trimmingVideo}
          onClose={() => setTrimmingVideo(null)}
          onSaved={(url, name) => {
            const entry: VideoEntry = { id: Math.random().toString(36).slice(2), url, script: name, name, createdAt: new Date().toISOString() };
            const updated = [entry, ...videos];
            setVideos(updated);
            localStorage.setItem("campanha_videos", JSON.stringify(updated));
            setTrimmingVideo(null);
          }}
          lang={lang}
          t={t as (k: string) => string}
        />
      )}
    </>
  );
}
