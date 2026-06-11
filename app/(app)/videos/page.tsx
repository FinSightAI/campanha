"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

type VideoEntry = { id: string; url: string; script: string; createdAt: string };

const CSS = `
  .vid-card { transition: transform .18s ease, box-shadow .18s ease; }
  .vid-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.25); }
  .play-btn { transition: transform .15s ease, opacity .15s ease; }
  .vid-thumb:hover .play-btn { transform: scale(1.1); }
`;

export default function VideosPage() {
  const { t, lang } = useLanguage();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setVideos(JSON.parse(localStorage.getItem("campanha_videos") || "[]"));
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

  const dateLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "he" ? "he-IL" : "en-US", { day: "numeric", month: "short" });
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
          <Link href="/create" className="px-4 py-2.5 rounded-lg text-sm font-bold" style={{ background: "var(--gold)", color: "#000" }}>
            + {t("vid_new")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }}>
          {videos.map((video) => (
            <div key={video.id} className="vid-card rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {/* Thumbnail / player */}
              {playing === video.id ? (
                <video src={video.url} controls autoPlay className="w-full aspect-video object-cover" />
              ) : (
                <div
                  className="vid-thumb relative w-full flex items-center justify-center cursor-pointer"
                  style={{ background: "var(--bg)", aspectRatio: "16/9" }}
                  onClick={() => setPlaying(video.id)}
                >
                  {/* Decorative lines suggesting video frame */}
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg,transparent 0,transparent 3px,rgba(255,255,255,.015) 3px,rgba(255,255,255,.015) 4px)", pointerEvents: "none" }} />
                  <button className="play-btn w-14 h-14 rounded-full flex items-center justify-center text-xl z-10" style={{ background: "var(--gold)", color: "#000" }}>
                    ▶
                  </button>
                </div>
              )}

              {/* Card body */}
              <div className="p-3">
                <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: "var(--text)" }}>
                  {video.script}{video.script?.length >= 80 ? "…" : ""}
                </p>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{dateLabel(video.createdAt)}</p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(video.url)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    {t("vid_share_wa")}
                  </a>
                  <a href={video.url} download
                    className="flex-1 py-2 rounded-lg text-xs font-bold text-center"
                    style={{ background: "var(--gold)", color: "#000" }}>
                    {t("vid_download")}
                  </a>
                  <button
                    onClick={() => copyLink(video.id, video.url)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: copied === video.id ? "var(--gold)" : "var(--border)", color: copied === video.id ? "#000" : "var(--muted)" }}
                  >
                    {copied === video.id ? "✓" : "🔗"}
                  </button>
                  <button
                    onClick={() => remove(video.id)}
                    className="px-2.5 py-2 rounded-lg text-xs transition-opacity hover:opacity-70"
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
