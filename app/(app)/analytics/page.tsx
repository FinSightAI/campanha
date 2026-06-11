"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

type VideoEntry = { id: string; url: string; script: string; name?: string; trackId?: string; createdAt: string };
type StatEntry = VideoEntry & { views: number };

export default function AnalyticsPage() {
  const { t, lang } = useLanguage();
  const [entries, setEntries] = useState<StatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vids: VideoEntry[] = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    const withTrack = vids.filter((v) => v.trackId);
    if (!withTrack.length) { setLoading(false); return; }

    const ids = withTrack.map((v) => v.trackId!);
    fetch(`/api/track?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const stats: Record<string, number> = data.stats || {};
        const merged = vids.map((v) => ({
          ...v,
          views: v.trackId ? (stats[v.trackId] ?? 0) : 0,
        })).sort((a, b) => b.views - a.views);
        setEntries(merged);
      })
      .catch(() => {
        setEntries(vids.map((v) => ({ ...v, views: 0 })));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalViews = entries.reduce((s, e) => s + e.views, 0);
  const topVideo = entries[0];
  const hasAny = entries.some((e) => e.trackId);

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "short" });

  const displayName = (v: StatEntry) =>
    v.name || v.script.split(" ").slice(0, 5).join(" ");

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <p className="text-sm animate-pulse" style={{ color: "var(--gold)" }}>
          {lang === "pt" ? "Carregando dados..." : "Loading data..."}
        </p>
      </div>
    );
  }

  if (!entries.length || !hasAny) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64 text-center max-w-lg">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{t("analytics_title")}</p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t("analytics_empty")}</p>
        <Link href="/create" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--gold)", color: "#000" }}>
          {lang === "pt" ? "Criar e compartilhar vídeo" : "Create and share a video"}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("analytics_title")}</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{t("analytics_subtitle")}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{t("analytics_total")}</p>
          <p className="text-3xl font-bold" style={{ color: "var(--gold)" }}>{totalViews}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t("analytics_views")}</p>
        </div>
        {topVideo && topVideo.views > 0 && (
          <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04))", border: "1px solid rgba(212,175,55,.4)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--gold)" }}>{t("analytics_top")}</p>
            <p className="text-sm font-bold truncate mb-0.5" style={{ color: "var(--text)" }}>{displayName(topVideo)}</p>
            <p className="text-2xl font-bold" style={{ color: "var(--gold)" }}>{topVideo.views}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{t("analytics_views")}</p>
          </div>
        )}
      </div>

      {/* Per-video table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {entries.map((e, i) => {
          const pct = totalViews > 0 ? (e.views / Math.max(entries[0].views, 1)) * 100 : 0;
          return (
            <div key={e.id} className="px-4 py-3" style={{ background: i % 2 === 0 ? "var(--card)" : "var(--bg)", borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs w-5 text-center font-bold" style={{ color: "var(--muted)" }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{displayName(e)}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{dateLabel(e.createdAt)}</p>
                  {/* Bar */}
                  {e.trackId && pct > 0 && (
                    <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "var(--gold)" }} />
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {e.trackId ? (
                    <>
                      <p className="text-base font-bold" style={{ color: e.views > 0 ? "var(--gold)" : "var(--muted)" }}>{e.views}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{t("analytics_views")}</p>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>—</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-4 text-center" style={{ color: "var(--muted)" }}>
        {lang === "pt"
          ? "Contagens registradas quando alguém abre o link de rastreamento"
          : "Counts recorded when someone opens the tracking link"}
      </p>
    </div>
  );
}
