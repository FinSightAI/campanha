"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [videoCount, setVideoCount] = useState(0);
  const [hasAvatar, setHasAvatar] = useState(false);

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    setVideoCount(videos.length);
    setHasAvatar(!!localStorage.getItem("campanha_avatar_id"));
  }, []);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
        {t("dash_greeting")}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        {t("dash_ready")}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{t("dash_avatar_label")}</p>
          <p className="text-lg font-semibold" style={{ color: hasAvatar ? "var(--gold)" : "var(--muted)" }}>
            {hasAvatar ? t("dash_avatar_set") : t("dash_avatar_not_set")}
          </p>
        </div>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{t("dash_videos_label")}</p>
          <p className="text-3xl font-bold" style={{ color: "var(--gold)" }}>{videoCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {!hasAvatar && (
          <Link
            href="/avatar"
            className="flex items-center gap-4 rounded-xl p-4 transition-opacity hover:opacity-90"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            <span className="text-2xl">◉</span>
            <div>
              <p className="font-bold">{t("dash_setup_avatar")}</p>
              <p className="text-xs opacity-70">{t("dash_setup_hint")}</p>
            </div>
            <span className="ms-auto">{t("dash_arrow")}</span>
          </Link>
        )}

        <Link
          href="/create"
          className="flex items-center gap-4 rounded-xl p-4 transition-colors"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <span className="text-2xl" style={{ color: "var(--gold)" }}>+</span>
          <div>
            <p className="font-bold">{t("dash_create_new")}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{t("dash_create_hint")}</p>
          </div>
          <span className="ms-auto" style={{ color: "var(--muted)" }}>{t("dash_arrow")}</span>
        </Link>

        <Link
          href="/videos"
          className="flex items-center gap-4 rounded-xl p-4 transition-colors"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <span className="text-2xl" style={{ color: "var(--gold)" }}>▶</span>
          <div>
            <p className="font-bold">{t("dash_my_videos")}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{videoCount} {t("nav_videos").toLowerCase()}</p>
          </div>
          <span className="ms-auto" style={{ color: "var(--muted)" }}>{t("dash_arrow")}</span>
        </Link>
      </div>
    </div>
  );
}
