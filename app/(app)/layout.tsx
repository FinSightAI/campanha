"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/translations";
import { useEffect, useState } from "react";

const CSS = `
  @media (max-width: 768px) {
    .sidebar {
      position: fixed !important;
      top: 0; left: 0; bottom: 0;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform .25s ease;
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 40;
    }
    .mobile-bar {
      display: flex;
    }
    .app-main {
      padding-top: 52px;
    }
  }
  @media (min-width: 769px) {
    .mobile-bar { display: none !important; }
    .sidebar { transform: none !important; }
    .sidebar-close { display: none !important; }
  }
`;

const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const [hasOwnKey, setHasOwnKey] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setHasOwnKey(!!localStorage.getItem("campanha_did_key")); }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navItems = [
    { href: "/dashboard", label: t("nav_home"), icon: "⌂" },
    { href: "/avatar", label: t("nav_avatar"), icon: "◉" },
    { href: "/create", label: t("nav_create"), icon: "+" },
    { href: "/videos", label: t("nav_videos"), icon: "▶" },
    { href: "/analytics", label: t("nav_analytics"), icon: "📊" },
    { href: "/burst", label: t("nav_burst"), icon: "⚡" },
    { href: "/calendar", label: t("nav_calendar"), icon: "📅" },
    { href: "/guide", label: t("nav_guide"), icon: "?" },
    { href: "/settings", label: t("nav_settings"), icon: "⚙" },
  ];

  const Sidebar = (
    <aside
      className={`sidebar w-56 flex-shrink-0 flex flex-col border-r${menuOpen ? " open" : ""}`}
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--gold)" }}>
          Campanha
        </Link>
        {/* Close button — mobile only */}
        <button onClick={() => setMenuOpen(false)} className="sidebar-close text-lg leading-none"
          style={{ color: "var(--muted)" }}>
          ✕
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--gold)" : "transparent",
                color: active ? "#000" : "var(--muted)",
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.href === "/settings" && hasOwnKey && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#000" : "var(--gold)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
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
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
        {/* Mobile overlay */}
        {menuOpen && (
          <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
        )}

        {Sidebar}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="mobile-bar items-center gap-3 px-4 py-3 border-b"
            style={{ background: "var(--card)", borderColor: "var(--border)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 30 }}>
            <button onClick={() => setMenuOpen(true)} className="text-xl leading-none" style={{ color: "var(--gold)" }}>
              ☰
            </button>
            <span className="text-base font-bold" style={{ color: "var(--gold)" }}>Campanha</span>
          </div>

          <main className="app-main flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
