"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/translations";
import { useEffect, useState } from "react";

const LANGS: { code: Lang; label: string }[] = [
  { code: "he", label: "עב" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const [hasOwnKey, setHasOwnKey] = useState(false);
  useEffect(() => { setHasOwnKey(!!localStorage.getItem("campanha_did_key")); }, []);

  const navItems = [
    { href: "/dashboard", label: t("nav_home"), icon: "⌂" },
    { href: "/avatar", label: t("nav_avatar"), icon: "◉" },
    { href: "/create", label: t("nav_create"), icon: "+" },
    { href: "/videos", label: t("nav_videos"), icon: "▶" },
    { href: "/burst", label: t("nav_burst"), icon: "⚡" },
    { href: "/guide", label: t("nav_guide"), icon: "?" },
    { href: "/settings", label: t("nav_settings"), icon: "⚙" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-e"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="text-xl font-bold" style={{ color: "var(--gold)" }}>
            Campanha
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? "var(--gold)" : "transparent",
                  color: active ? "#000" : "var(--muted)",
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.href === "/settings" && hasOwnKey && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          {/* Language switcher */}
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className="flex-1 py-1 rounded text-xs font-bold transition-colors"
                style={{
                  background: lang === l.code ? "var(--gold)" : "var(--bg)",
                  color: lang === l.code ? "#000" : "var(--muted)",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {t("nav_powered")}
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
