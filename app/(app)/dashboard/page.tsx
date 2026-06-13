"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
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
  .dash-card { transition: transform .18s ease; }
  .dash-card:hover { transform: translateY(-2px); }
  .demo-play { animation: pulse-ring 2s ease-out infinite; }
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

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const [videoCount, setVideoCount] = useState(0);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    setVideoCount(videos.length);
    setHasAvatar(!!localStorage.getItem("campanha_avatar_id"));
  }, []);

  if (hasAvatar === null) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="p-8 max-w-3xl">
        {!hasAvatar ? (
          /* ─── ONBOARDING ─── */
          <>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {t("dash_onboard_title")}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              {t("dash_onboard_sub")}
            </p>

            {/* 3-step visual */}
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

            {/* Demo card */}
            <div className="ob-step rounded-xl p-5 mb-6 flex items-center gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
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

            {/* CTA */}
            <div className="ob-cta space-y-3">
              <Link
                href="/avatar"
                className="dash-card flex items-center gap-4 rounded-xl p-5"
                style={{ background: "var(--gold)", color: "#000" }}
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
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
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
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {t("dash_greeting")}
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              {t("dash_ready")}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{t("dash_avatar_label")}</p>
                <p className="text-lg font-semibold" style={{ color: "var(--gold)" }}>
                  {t("dash_avatar_set")}
                </p>
              </div>
              <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{t("dash_videos_label")}</p>
                <p className="text-3xl font-bold" style={{ color: "var(--gold)" }}>{videoCount}</p>
              </div>
            </div>

            {/* Gamification */}
            <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--gold)" }}>📊</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {GAMIFY[lang]?.(videoCount) ?? GAMIFY.pt(videoCount)}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/create"
                className="dash-card flex items-center gap-4 rounded-xl p-4"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                <span className="text-2xl">✍️</span>
                <div>
                  <p className="font-bold">{t("dash_create_new")}</p>
                  <p className="text-xs opacity-70">{t("dash_create_hint")}</p>
                </div>
                <span className="ml-auto font-bold">→</span>
              </Link>

              <Link
                href="/videos"
                className="dash-card flex items-center gap-4 rounded-xl p-4 transition-colors"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                <span className="text-2xl" style={{ color: "var(--gold)" }}>▶</span>
                <div>
                  <p className="font-bold">{t("dash_my_videos")}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{videoCount} {t("nav_videos").toLowerCase()}</p>
                </div>
                <span className="ml-auto" style={{ color: "var(--muted)" }}>→</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
