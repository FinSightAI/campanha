"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

type VideoEntry = { id: string; url: string; script: string; name?: string; trackId?: string; createdAt: string };

const CSS = `
  .vid-card { transition: transform .18s ease, box-shadow .18s ease; }
  .vid-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.25); }
  .play-btn { transition: transform .15s ease, opacity .15s ease; }
  .vid-thumb:hover .play-btn { transform: scale(1.1); }
`;

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

  useEffect(() => {
    const vids: VideoEntry[] = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    setVideos(vids);
    setAvatarName(localStorage.getItem("campanha_avatar_name") || "");
    setAvatarThumb(localStorage.getItem("campanha_avatar_thumbnail") || "");
    // Fetch stats for videos with trackIds
    const ids = vids.map((v) => v.trackId).filter(Boolean) as string[];
    if (ids.length) {
      fetch(`/api/track?ids=${ids.join(",")}`)
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
      <div className="p-8 max-w-4xl">
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
            const waUrl = `https://wa.me/?text=${encodeURIComponent(waMsg(avatarName, video.url, lang))}`;

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
                        const text = waMsg(avatarName, video.url, lang);
                        if (navigator.share) { try { await navigator.share({ text, url: video.url }); return; } catch { /* fallback */ } }
                        try { await navigator.clipboard.writeText(video.url); } catch { /* ignore */ }
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
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(video.url)}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "#1877F2", color: "#fff" }}>
                      FB
                    </a>
                    <a href={video.url} download
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                      style={{ background: "var(--gold)", color: "#000" }}>
                      {t("vid_download")}
                    </a>
                    <button onClick={() => copyLink(video.id, video.url)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: copied === video.id ? "var(--gold)" : "var(--border)", color: copied === video.id ? "#000" : "var(--muted)" }}>
                      {copied === video.id ? "✓" : "🔗"}
                    </button>
                    <button onClick={() => remove(video.id)}
                      className="px-2.5 py-2 rounded-lg text-xs transition-opacity hover:opacity-70"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
