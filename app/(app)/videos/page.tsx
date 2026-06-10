"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

type VideoEntry = { id: string; url: string; script: string; createdAt: string };

export default function VideosPage() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    setVideos(JSON.parse(localStorage.getItem("campanha_videos") || "[]"));
  }, []);

  function remove(id: string) {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem("campanha_videos", JSON.stringify(updated));
  }

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
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{t("vid_title")}</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{videos.length}</p>
        </div>
        <Link href="/create" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: "var(--gold)", color: "#000" }}>
          {t("vid_new")}
        </Link>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {playing === video.id ? (
              <video src={video.url} controls autoPlay className="w-full" />
            ) : (
              <div
                className="h-48 flex items-center justify-center cursor-pointer"
                style={{ background: "var(--bg)" }}
                onClick={() => setPlaying(video.id)}
              >
                <button className="w-16 h-16 rounded-full flex items-center justify-center text-2xl hover:opacity-90" style={{ background: "var(--gold)", color: "#000" }}>▶</button>
              </div>
            )}
            <div className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                  {video.script}{video.script?.length >= 80 ? "..." : ""}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
              <a href={video.url} download className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "var(--gold)", color: "#000" }}>
                {t("vid_download")}
              </a>
              <button onClick={() => remove(video.id)} className="px-3 py-1.5 rounded-lg text-xs" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                {t("vid_delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
