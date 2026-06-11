"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

const CSS = `
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}
  }
  .ob-step { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
  .ob-step:nth-child(1){animation-delay:.05s}
  .ob-step:nth-child(2){animation-delay:.15s}
  .ob-step:nth-child(3){animation-delay:.25s}
  .ob-cta { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .4s both; }
  .dash-card:hover { transform: translateY(-2px); }
  .dash-card { transition: transform .18s ease; }
`;

export default function Dashboard() {
  const { t } = useLanguage();
  const [videoCount, setVideoCount] = useState(0);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    setVideoCount(videos.length);
    setHasAvatar(!!localStorage.getItem("campanha_avatar_id"));
  }, []);

  if (hasAvatar === null) return null; // avoid flash

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

            <div className="grid grid-cols-3 gap-4 mb-8">
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
                  <div
                    className="text-xs font-bold mb-1 px-2 py-0.5 rounded-full inline-block"
                    style={{
                      background: s.active ? "var(--gold)" : "var(--border)",
                      color: s.active ? "#000" : "var(--muted)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold mt-2 mb-1" style={{ color: s.active ? "var(--gold)" : "var(--text)" }}>
                    {s.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="ob-cta">
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
            </div>
          </>
        ) : (
          /* ─── NORMAL DASHBOARD ─── */
          <>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {t("dash_greeting")}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              {t("dash_ready")}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
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
                <span className="ms-auto font-bold">→</span>
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
                <span className="ms-auto" style={{ color: "var(--muted)" }}>→</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
