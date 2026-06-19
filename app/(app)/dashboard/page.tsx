"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { getAppHeaders } from "@/lib/didKey";
import type { Lang } from "@/lib/translations";

const CSS = `
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}
  }
  @keyframes pulse-ring {
    0%{box-shadow:0 0 0 0 rgba(212,175,55,.4)}70%{box-shadow:0 0 0 10px rgba(212,175,55,0)}100%{box-shadow:0 0 0 0 rgba(212,175,55,0)}
  }
  .ob-step { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
  .ob-step:nth-child(1){animation-delay:.05s}
  .ob-step:nth-child(2){animation-delay:.15s}
  .ob-step:nth-child(3){animation-delay:.25s}
  .ob-cta { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .4s both; }
  .dash-card { transition: transform .18s ease, box-shadow .18s ease; }
  .dash-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .demo-play { animation: pulse-ring 2s ease-out infinite; }
  .stat-card { transition: transform .18s ease, box-shadow .18s ease; cursor: default; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .mini-vid { transition: transform .18s ease, box-shadow .18s ease; }
  .mini-vid:hover { transform: translateY(-3px); box-shadow: var(--shadow-hover); }
`;

const GAMIFY: Record<Lang, (n: number) => string> = {
  pt: (n) => n === 0 ? "Crie seu primeiro vídeo — é em 60 segundos!"
    : n < 3 ? `${n} vídeo${n > 1 ? "s" : ""} criado${n > 1 ? "s" : ""}. Políticos ativos criam 5+ por semana.`
    : n < 8 ? `${n} vídeos criados. Você está no caminho certo! 🚀`
    : `${n} vídeos criados. Excelente — você é um criador ativo! 🏆`,
  en: (n) => n === 0 ? "Create your first video — takes 60 seconds!"
    : n < 3 ? `${n} video${n > 1 ? "s" : ""} created. Active politicians create 5+ per week.`
    : n < 8 ? `${n} videos created. You're on the right track! 🚀`
    : `${n} videos created. Excellent — you're an active creator! 🏆`,
  he: (n) => n === 0 ? "צור את הסרטון הראשון — לוקח 60 שניות!"
    : n < 3 ? `${n} סרטון${n > 1 ? "ות" : ""} נוצר${n > 1 ? "ו" : ""}. פוליטיקאים פעילים יוצרים 5+ בשבוע.`
    : n < 8 ? `${n} סרטונים נוצרו. אתה בדרך הנכונה! 🚀`
    : `${n} סרטונים נוצרו. מצוין — אתה יוצר פעיל! 🏆`,
};

type VideoEntry = { id: string; url: string; script: string; name?: string; trackId?: string; createdAt: string };

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const [videoCount, setVideoCount] = useState(0);
  const [recentVideos, setRecentVideos] = useState<VideoEntry[]>([]);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [avatarThumb, setAvatarThumb] = useState("");
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [sharedCount, setSharedCount] = useState(0);

  useEffect(() => {
    const videos: VideoEntry[] = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    setVideoCount(videos.length);
    setRecentVideos(videos.slice(0, 3));
    setSharedCount(videos.filter((v) => v.trackId).length);
    setHasAvatar(!!localStorage.getItem("campanha_avatar_id"));
    setAvatarName(localStorage.getItem("campanha_avatar_name") || "");
    setAvatarThumb(localStorage.getItem("campanha_avatar_thumbnail") || "");

    const ids = videos.map((v) => v.trackId).filter(Boolean) as string[];
    if (ids.length) {
      fetch(`/api/track?ids=${ids.join(",")}`, { headers: getAppHeaders() })
        .then((r) => r.json())
        .then((data) => {
          const stats: Record<string, number> = data.stats || {};
          const total = ids.reduce((s, id) => s + (stats[id] || 0), 0);
          setTotalViews(total);
        })
        .catch(() => {});
    } else {
      setTotalViews(0);
    }
  }, []);

  if (hasAvatar === null) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="p-8" style={{ maxWidth: "min(72rem, 100%)", margin: "0 auto", width: "100%" }}>
        {!hasAvatar ? (
          /* ─── ONBOARDING ─── */
          <>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {t("dash_onboard_title")}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              {t("dash_onboard_sub")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { emoji: "🎬", label: t("avt_title"), sub: t("avt_subtitle").split(" — ")[0], active: true },
                { emoji: "✍️", label: t("crt_title"), sub: t("crt_subtitle"), active: false },
                { emoji: "▶️", label: t("crt_done_title"), sub: t("crt_done_sub"), active: false },
              ].map((s, i) => (
                <div
                  key={i}
                  className="ob-step rounded-xl p-5 text-center"
                  style={{
                    background: s.active ? "linear-gradient(135deg,rgba(212,175,55,.13),rgba(212,175,55,.04))" : "var(--card)",
                    border: `1px solid ${s.active ? "var(--gold)" : "var(--border)"}`,
                    boxShadow: s.active ? "var(--glow-gold)" : "var(--shadow-card)",
                  }}
                >
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                    style={{ background: s.active ? "var(--gold)" : "var(--border)", color: s.active ? "#000" : "var(--muted)" }}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: s.active ? "var(--gold)" : "var(--text)" }}>
                    {s.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="ob-step rounded-xl p-5 mb-6 flex items-center gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="demo-play w-10 h-10 rounded-full flex items-center justify-center text-base" style={{ background: "var(--gold)", color: "#000" }}>▶</div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold mb-0.5" style={{ color: "var(--text)" }}>
                  {lang === "pt" ? "Veja como fica o resultado" : lang === "en" ? "See what the result looks like" : "ראה איך נראה הפלט"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {lang === "pt" ? "Vídeo do candidato falando com IA · 30–90 seg · MP4" : lang === "en" ? "Candidate speaking video with AI · 30–90 sec · MP4" : "סרטון מועמד מדבר עם AI · 30–90 שנ · MP4"}
                </p>
              </div>
              <a href="/pitch" target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold px-3 py-2 rounded-lg flex-shrink-0"
                style={{ background: "var(--border)", color: "var(--muted)" }}>
                {lang === "pt" ? "Ver demo" : lang === "en" ? "See demo" : "ראה דמו"}
              </a>
            </div>

            <div className="ob-cta space-y-3">
              <Link
                href="/avatar"
                className="dash-card flex items-center gap-4 rounded-xl p-5"
                style={{ background: "var(--gold)", color: "#000", boxShadow: "var(--glow-gold)" }}
              >
                <span className="text-2xl">🎬</span>
                <div className="flex-1">
                  <p className="font-bold text-base">{t("dash_setup_avatar")}</p>
                  <p className="text-xs opacity-70">{t("dash_setup_hint")}</p>
                </div>
                <span className="text-lg font-bold">→</span>
              </Link>
              <Link
                href="/create?ai=1"
                className="dash-card flex items-center gap-4 rounded-xl p-4"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", boxShadow: "var(--shadow-card)" }}
              >
                <span className="text-xl">✍️</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {lang === "pt" ? "Experimente o roteirista IA primeiro" : lang === "en" ? "Try the AI scriptwriter first" : "נסה קודם את כותב הנאומים"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {lang === "pt" ? "Sem avatar — veja a qualidade dos roteiros" : lang === "en" ? "No avatar needed — see script quality" : "ללא אוואטר — ראה את איכות הנאומים"}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>→</span>
              </Link>
            </div>
          </>
        ) : (
          /* ─── NORMAL DASHBOARD ─── */
          <>
            {/* Hero */}
            <div className="dash-card flex items-center gap-4 rounded-2xl p-5 mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(230,194,90,.12), rgba(139,123,255,.06))",
                border: "1px solid rgba(230,194,90,.3)",
                boxShadow: "var(--glow-gold)",
              }}>
              {avatarThumb ? (
                <img src={avatarThumb} alt={avatarName} className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  style={{ border: "2px solid var(--gold)" }} />
              ) : (
                <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: "var(--card)", border: "2px solid var(--gold)" }}>🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gold)", opacity: .8 }}>
                  {lang === "pt" ? "Central de Campanha" : lang === "en" ? "Campaign Center" : "מרכז הקמפיין"}
                </p>
                <h1 className="text-xl font-bold truncate" style={{ color: "var(--text)" }}>
                  {avatarName
                    ? `${lang === "pt" ? "Olá" : lang === "en" ? "Hello" : "שלום"}, ${avatarName}`
                    : t("dash_greeting")}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t("dash_ready")}</p>
              </div>
              <Link href="/create"
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "var(--gold)", color: "#000" }}>
                <span>+</span>
                <span>{lang === "pt" ? "Criar" : lang === "en" ? "Create" : "צור"}</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="stat-card rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <p className="text-3xl font-bold mb-0.5" style={{ color: "var(--gold)" }}>{videoCount}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{lang === "pt" ? "Vídeos" : lang === "en" ? "Videos" : "סרטונים"}</p>
              </div>
              <div className="stat-card rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <p className="text-3xl font-bold mb-0.5" style={{ color: "var(--gold)" }}>{sharedCount}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{lang === "pt" ? "Compartilhados" : lang === "en" ? "Shared" : "שותפו"}</p>
              </div>
              <div className="stat-card rounded-xl p-4 text-center"
                style={{
                  background: totalViews !== null && totalViews > 0
                    ? "linear-gradient(135deg,rgba(230,194,90,.1),rgba(230,194,90,.03))"
                    : "var(--card)",
                  border: `1px solid ${totalViews !== null && totalViews > 0 ? "rgba(230,194,90,.35)" : "var(--border)"}`,
                  boxShadow: totalViews !== null && totalViews > 0 ? "var(--glow-gold)" : "var(--shadow-card)",
                }}>
                <p className="text-3xl font-bold mb-0.5" style={{ color: "var(--gold)" }}>
                  {totalViews !== null ? totalViews : "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{lang === "pt" ? "Visualizações" : lang === "en" ? "Views" : "צפיות"}</p>
              </div>
            </div>

            {/* Gamification */}
            <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
              <span style={{ color: "var(--gold)" }}>📊</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {GAMIFY[lang]?.(videoCount) ?? GAMIFY.pt(videoCount)}
              </p>
            </div>

            {/* Recent videos */}
            {recentVideos.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    {lang === "pt" ? "Vídeos recentes" : lang === "en" ? "Recent videos" : "סרטונים אחרונים"}
                  </p>
                  <Link href="/videos" className="text-xs font-medium" style={{ color: "var(--gold)" }}>
                    {lang === "pt" ? "Ver todos →" : lang === "en" ? "View all →" : "הכל →"}
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {recentVideos.map((v) => (
                    <Link key={v.id} href="/videos"
                      className="mini-vid rounded-xl overflow-hidden"
                      style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                      <div className="relative flex items-center justify-center"
                        style={{
                          aspectRatio: "16/9",
                          background: avatarThumb ? `url(${avatarThumb}) center/cover` : "var(--bg)",
                        }}>
                        {avatarThumb && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />
                        )}
                        <span className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "var(--gold)", color: "#000" }}>▶</span>
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
                          {v.name || v.script.split(" ").slice(0, 4).join(" ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/create"
                className="dash-card flex items-center gap-4 rounded-xl p-4"
                style={{ background: "var(--gold)", color: "#000", boxShadow: "var(--glow-gold)" }}>
                <span className="text-2xl">✍️</span>
                <div className="flex-1">
                  <p className="font-bold">{t("dash_create_new")}</p>
                  <p className="text-xs opacity-70">{t("dash_create_hint")}</p>
                </div>
                <span className="ml-auto font-bold">→</span>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/burst"
                  className="dash-card flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", boxShadow: "var(--shadow-card)" }}>
                  <span className="text-xl" style={{ color: "var(--gold)" }}>⚡</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t("nav_burst")}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                      {lang === "pt" ? "Múltiplos vídeos" : lang === "en" ? "Multiple videos" : "מספר סרטונים"}
                    </p>
                  </div>
                </Link>
                <Link href="/analytics"
                  className="dash-card flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", boxShadow: "var(--shadow-card)" }}>
                  <span className="text-xl" style={{ color: "var(--gold)" }}>📊</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t("nav_analytics")}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                      {lang === "pt" ? "Ver resultados" : lang === "en" ? "View results" : "ראה תוצאות"}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
