"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const { lang } = useLanguage();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("campanha_theme") as Theme) || "dark";
    setTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("campanha_theme", next); } catch { /* ignore */ }
  }

  const goLight = theme === "dark";
  const label = goLight
    ? (lang === "pt" ? "Modo claro" : lang === "en" ? "Light mode" : "מצב בהיר")
    : (lang === "pt" ? "Modo escuro" : lang === "en" ? "Dark mode" : "מצב כהה");

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors"
      style={{ background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--gold)" }}
    >
      <span>{goLight ? "☀️" : "🌙"}</span>
      <span>{label}</span>
    </button>
  );
}
