"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

const SYNC_KEYS = [
  "campanha_avatar_id", "campanha_avatar_name", "campanha_avatar_voice_id",
  "campanha_avatar_thumbnail", "campanha_videos", "campanha_scripts", "campanha_lang",
];

export default function SettingsPage() {
  const { t, lang } = useLanguage();
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // Sync state
  const [syncCode, setSyncCode] = useState("");
  const [syncSaving, setSyncSaving] = useState(false);
  const [loadCode, setLoadCode] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const stored = localStorage.getItem("campanha_did_key") || "";
    setKey(stored);
    setHasKey(!!stored);
  }, []);

  function save() {
    localStorage.setItem("campanha_did_key", key.trim());
    setHasKey(!!key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clear() {
    localStorage.removeItem("campanha_did_key");
    setKey("");
    setHasKey(false);
  }

  async function generateSyncCode() {
    setSyncSaving(true);
    setSyncCode("");
    try {
      const data: Record<string, string | null> = {};
      SYNC_KEYS.forEach((k) => { data[k] = localStorage.getItem(k); });
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (res.ok) setSyncCode(json.code);
    } catch { /* ignore */ } finally {
      setSyncSaving(false);
    }
  }

  async function loadFromCode() {
    if (!loadCode.trim()) return;
    setLoadState("loading");
    try {
      const res = await fetch(`/api/sync?code=${encodeURIComponent(loadCode.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error();
      const data: Record<string, string | null> = json.data;
      SYNC_KEYS.forEach((k) => {
        if (data[k] !== undefined && data[k] !== null) localStorage.setItem(k, data[k]!);
        else localStorage.removeItem(k);
      });
      setLoadState("success");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setLoadState("error");
      setTimeout(() => setLoadState("idle"), 3000);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("set_title")}</h1>

      {/* D-ID Key */}
      <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{t("set_did_title")}</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: hasKey ? "var(--gold)" : "var(--border)", color: hasKey ? "#000" : "var(--muted)" }}>
            {hasKey ? t("set_status_own") : t("set_status_default")}
          </span>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>{t("set_did_desc")}</p>
        <div className="rounded-lg p-4 mb-5" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--gold)" }}>{t("set_did_how")}</p>
          {[t("set_did_s1"), t("set_did_s2"), t("set_did_s3")].map((step, i) => (
            <div key={i} className="flex gap-2.5 mb-2 last:mb-0">
              <span className="w-5 h-5 rounded-full text-xs flex-shrink-0 flex items-center justify-center font-bold mt-0.5"
                style={{ background: "var(--gold)", color: "#000" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{step}</p>
            </div>
          ))}
        </div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("set_did_label")}</label>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
          placeholder={t("set_did_ph")}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4 font-mono"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        <div className="flex gap-3">
          <button onClick={save} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--gold)", color: "#000" }}>
            {saved ? t("set_saved") : t("set_save")}
          </button>
          {hasKey && (
            <button onClick={clear} className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              {t("set_clear")}
            </button>
          )}
        </div>
      </div>

      {/* Sync */}
      <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h2 className="text-base font-bold mb-1" style={{ color: "var(--text)" }}>{t("sync_title")}</h2>
        <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>{t("sync_desc")}</p>

        {/* Generate */}
        <div className="mb-5">
          <button onClick={generateSyncCode} disabled={syncSaving}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}>
            {syncSaving ? t("sync_saving") : t("sync_generate")}
          </button>
          {syncCode && (
            <div className="mt-3 rounded-xl p-4 text-center" style={{ background: "var(--bg)", border: "1px solid rgba(212,175,55,.4)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>{t("sync_code_label")}</p>
              <p className="text-3xl font-bold tracking-widest" style={{ color: "var(--gold)", fontFamily: "monospace" }}>{syncCode}</p>
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                {lang === "pt"
                  ? "Digite este código no outro dispositivo"
                  : "Enter this code on the other device"}
              </p>
            </div>
          )}
        </div>

        {/* Load */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>{t("sync_load_label")}</p>
          <div className="flex gap-2">
            <input value={loadCode} onChange={(e) => setLoadCode(e.target.value.toUpperCase())}
              placeholder={t("sync_enter")} maxLength={8}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none font-mono tracking-widest uppercase"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <button onClick={loadFromCode} disabled={!loadCode.trim() || loadState === "loading"}
              className="px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{
                background: loadState === "success" ? "#22c55e" : loadState === "error" ? "#e55" : "var(--gold)",
                color: "#000",
              }}>
              {loadState === "loading" ? "…" : loadState === "success" ? "✓" : loadState === "error" ? "✕" : t("sync_load_btn")}
            </button>
          </div>
          {loadState === "success" && <p className="text-xs mt-1.5" style={{ color: "#22c55e" }}>{t("sync_success")}</p>}
          {loadState === "error" && <p className="text-xs mt-1.5" style={{ color: "#e55" }}>{t("sync_error")}</p>}
        </div>
      </div>
    </div>
  );
}
