"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/translations";

const LANGS: { code: Lang; label: string }[] = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

export default function Home() {
  const { t, lang, setLang } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      {/* Language picker top */}
      <div className="absolute top-4 left-4 flex gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: lang === l.code ? "var(--gold)" : "var(--card)",
              color: lang === l.code ? "#000" : "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="text-center max-w-xl">
        <div className="mb-8">
          <span className="text-5xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
            Campanha
          </span>
          <p className="mt-2 text-sm tracking-widest uppercase" style={{ color: "var(--muted)" }}>
            {t("land_tagline")}
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
          {t("land_h1")}
          <br />
          <span style={{ color: "var(--gold)" }}>{t("land_h2")}</span>
        </h1>

        <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          {t("land_desc")}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
          {(["land_step1", "land_step2", "land_step3"] as const).map((key, i) => (
            <div
              key={key}
              className="rounded-xl p-4 flex flex-col items-center gap-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                {i + 1}
              </span>
              <span style={{ color: "var(--text)" }}>{t(key)}</span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 rounded-xl text-base font-bold transition-opacity hover:opacity-90"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          {t("land_cta")}
        </Link>

        <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
          {t("land_note")}
        </p>
      </div>
    </main>
  );
}
