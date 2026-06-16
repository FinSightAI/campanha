"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { getDIDHeaders, getAppHeaders } from "@/lib/didKey";

type VidStatus = "idle" | "pending" | "generating" | "done" | "error";

interface Variant {
  audience: string;
  script: string;
  vidStatus: VidStatus;
  vidUrl?: string;
  trackId?: string;
  vidError?: string;
}

type SavedVideo = { id: string; url: string; script: string; name: string; trackId?: string; createdAt: string };

export default function BurstPage() {
  const { t, lang } = useLanguage();
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [area, setArea] = useState("");
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");
  const pollRefs = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());
  const creatingRef = useRef(false);

  // Share through the labeled /v/<id> watch page (AI-content disclosure / TSE)
  // whenever a tracking link exists; fall back to the raw file otherwise.
  const shareUrl = (v: Variant) => (v.trackId && origin ? `${origin}/v/${v.trackId}` : v.vidUrl || "");

  useEffect(() => {
    const refs = pollRefs.current;
    return () => refs.forEach(id => clearInterval(id));
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    setAvatarId(localStorage.getItem("campanha_avatar_id"));
    setVoiceId(localStorage.getItem("campanha_avatar_voice_id"));
  }, []);

  async function createTrack(videoUrl: string): Promise<string | undefined> {
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAppHeaders() },
        body: JSON.stringify({ videoUrl }),
      });
      const d = await res.json();
      return res.ok ? d.id : undefined;
    } catch { return undefined; }
  }

  function setVariant(i: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v));
  }

  async function writeScripts() {
    if (!topic.trim()) return;
    setWriting(true);
    setWriteError("");
    setVariants([]);
    try {
      const personalContext = [
        localStorage.getItem("campanha_avatar_name") && `Name: ${localStorage.getItem("campanha_avatar_name")}`,
        localStorage.getItem("campanha_profile_role") && `Role: ${localStorage.getItem("campanha_profile_role")}`,
        localStorage.getItem("campanha_profile_city") && `City: ${localStorage.getItem("campanha_profile_city")}`,
        localStorage.getItem("campanha_profile_party") && `Party: ${localStorage.getItem("campanha_profile_party")}`,
        localStorage.getItem("campanha_profile_topics") && `Campaign issues: ${localStorage.getItem("campanha_profile_topics")}`,
        localStorage.getItem("campanha_profile_style") && `Speaking style:\n${localStorage.getItem("campanha_profile_style")}`,
      ].filter(Boolean).join("\n");
      const res = await fetch("/api/ai-burst", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAppHeaders() },
        body: JSON.stringify({ topic, area, lang, personalContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const list = Array.isArray(data.variants) ? data.variants : [];
      if (!list.length) throw new Error(t("err_unknown"));
      setVariants(list.map((v: { audience: string; script: string }) => ({
        ...v,
        vidStatus: "idle",
      })));
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : t("err_unknown"));
    } finally {
      setWriting(false);
    }
  }

  async function createAll() {
    if (!avatarId || !variants.length || creatingRef.current) return; // guard double-fire (double-spend)
    creatingRef.current = true;
    setVariants((prev) => prev.map((v) => v.vidStatus === "done" ? v : { ...v, vidStatus: "pending" }));

    try {
      await Promise.all(variants.map(async (variant, i) => {
        if (variant.vidStatus === "done") return;
        try {
          setVariant(i, { vidStatus: "generating" });
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getDIDHeaders() },
            body: JSON.stringify({ script: variant.script.trim(), avatarId, voiceId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          pollOne(i, data.id, variant.script, variant.audience);
        } catch (e: unknown) {
          setVariant(i, { vidStatus: "error", vidError: e instanceof Error ? e.message : t("err_unknown") });
        }
      }));
    } finally {
      creatingRef.current = false;
    }
  }

  function pollOne(i: number, id: string, script: string, audience?: string) {
    const MAX = 60;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(interval); pollRefs.current.delete(i);
        setVariant(i, { vidStatus: "error", vidError: t("err_timeout") });
        return;
      }
      try {
        const res = await fetch(`/api/status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(interval); pollRefs.current.delete(i);
          // Create the labeled tracking link so external shares carry the AI disclosure (TSE).
          const trackId = await createTrack(data.result_url);
          setVariant(i, { vidStatus: "done", vidUrl: data.result_url, trackId });
          saveVideo(id, data.result_url, script, audience, trackId);
        } else if (data.status === "error") {
          clearInterval(interval); pollRefs.current.delete(i);
          setVariant(i, { vidStatus: "error", vidError: t("err_ai") });
        }
      } catch { /* keep polling */ }
    }, 3000);
    pollRefs.current.set(i, interval);
  }

  function saveVideo(id: string, url: string, script: string, audience?: string, trackId?: string) {
    let videos: SavedVideo[] = [];
    // Re-read fresh and dedupe-on-id so concurrent burst saves don't drop each other.
    try { videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]"); } catch { videos = []; }
    if (videos.some((v) => v.id === id)) return;
    const name = audience || script.trim().split(/\s+/).slice(0, 6).join(" ");
    videos.unshift({ id, url, script: script.substring(0, 80), name, trackId, createdAt: new Date().toISOString() });
    localStorage.setItem("campanha_videos", JSON.stringify(videos.slice(0, 100)));
  }

  async function copyLink(url: string, i: number) {
    await navigator.clipboard.writeText(url);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  const allDone = variants.length > 0 && variants.every((v) => v.vidStatus === "done" || v.vidStatus === "error");
  const anyGenerating = variants.some((v) => v.vidStatus === "generating" || v.vidStatus === "pending");

  if (!avatarId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64 text-center">
        <p className="text-3xl mb-3">⚡</p>
        <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{t("burst_no_avatar")}</p>
        <Link href="/avatar" className="mt-4 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--gold)", color: "#000" }}>
          {t("nav_avatar")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("burst_title")}</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{t("burst_subtitle")}</p>

      {/* Input form */}
      <div className="rounded-xl p-5 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("burst_topic_label")}</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("burst_topic_ph")}
              disabled={writing || anyGenerating}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("burst_area_label")}</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t("burst_area_ph")}
              disabled={writing || anyGenerating}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>
        {writeError && <p className="text-xs mb-3" style={{ color: "#e55" }}>{writeError}</p>}
        <button
          onClick={writeScripts}
          disabled={!topic.trim() || writing}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          {writing ? t("burst_writing") : t("burst_write")}
        </button>
      </div>

      {/* Variant cards */}
      {variants.length > 0 && (
        <>
          <p className="text-xs mb-3 font-semibold" style={{ color: "var(--muted)" }}>{t("burst_edit_hint")}</p>
          <div className="space-y-4 mb-6">
            {variants.map((v, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>{v.audience}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: v.vidStatus === "done" ? "var(--gold)" : v.vidStatus === "error" ? "#e55" : "var(--border)",
                    color: v.vidStatus === "done" ? "#000" : v.vidStatus === "error" ? "#fff" : "var(--muted)",
                  }}>
                    {v.vidStatus === "idle" ? "—"
                      : v.vidStatus === "pending" || v.vidStatus === "generating" ? t("burst_creating")
                      : v.vidStatus === "done" ? "✓"
                      : "✕"}
                  </span>
                </div>

                {/* Script editor */}
                <div style={{ background: "var(--bg)" }}>
                  <textarea
                    value={v.script}
                    onChange={(e) => setVariant(i, { script: e.target.value })}
                    rows={4}
                    disabled={anyGenerating}
                    className="w-full px-4 py-3 text-sm outline-none resize-none"
                    style={{ background: "transparent", color: "var(--text)" }}
                  />
                </div>

                {/* Video result */}
                {v.vidStatus === "done" && v.vidUrl && (
                  <div style={{ background: "var(--card)" }}>
                    <video src={v.vidUrl} controls className="w-full" />
                    <div className="flex flex-wrap gap-2 p-3">
                      <a href={v.vidUrl} download
                        className="flex-1 min-w-[72px] py-2 rounded-lg text-xs font-bold text-center"
                        style={{ background: "var(--gold)", color: "#000" }}>
                        {t("crt_download")}
                      </a>
                      <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl(v))}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 min-w-[72px] py-2 rounded-lg text-xs font-bold text-center"
                        style={{ background: "#25D366", color: "#fff" }}>
                        WhatsApp
                      </a>
                      <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl(v))}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 min-w-[72px] py-2 rounded-lg text-xs font-bold text-center"
                        style={{ background: "#0088cc", color: "#fff" }}>
                        Telegram
                      </a>
                      <button onClick={() => copyLink(shareUrl(v), i)}
                        className="flex-1 min-w-[72px] py-2 rounded-lg text-xs font-bold"
                        style={{ background: copied === i ? "var(--gold)" : "var(--border)", color: copied === i ? "#000" : "var(--text)" }}>
                        {copied === i ? t("crt_copied") : t("crt_copy_link")}
                      </button>
                    </div>
                  </div>
                )}
                {v.vidStatus === "error" && v.vidError && (
                  <p className="px-4 py-2 text-xs" style={{ background: "var(--card)", color: "#e55" }}>{v.vidError}</p>
                )}
              </div>
            ))}
          </div>

          {/* Create all button */}
          {!anyGenerating && !allDone && (
            <button
              onClick={createAll}
              className="w-full py-4 rounded-xl font-bold text-base"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              {t("burst_create_all")}
            </button>
          )}

          {anyGenerating && (
            <div className="w-full py-4 rounded-xl text-center text-sm animate-pulse"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}>
              {t("burst_creating")} {variants.filter((v) => v.vidStatus === "done").length}/{variants.length}
            </div>
          )}

          {allDone && (
            <div className="w-full py-3 rounded-xl text-center text-sm font-bold"
              style={{ background: "var(--card)", border: "1px solid var(--gold)", color: "var(--gold)" }}>
              ✓ {t("burst_done")} {variants.filter((v) => v.vidStatus === "done").length}/{variants.length}
            </div>
          )}
        </>
      )}
    </div>
  );
}
