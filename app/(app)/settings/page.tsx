"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function SettingsPage() {
  const { t } = useLanguage();
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

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

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("set_title")}</h1>

      <div className="mt-8 rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{t("set_did_title")}</h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: hasKey ? "var(--gold)" : "var(--border)",
              color: hasKey ? "#000" : "var(--muted)",
            }}
          >
            {hasKey ? t("set_status_own") : t("set_status_default")}
          </span>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>{t("set_did_desc")}</p>

        {/* How-to steps */}
        <div className="rounded-lg p-4 mb-5" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--gold)" }}>{t("set_did_how")}</p>
          {[t("set_did_s1"), t("set_did_s2"), t("set_did_s3")].map((step, i) => (
            <div key={i} className="flex gap-2.5 mb-2 last:mb-0">
              <span
                className="w-5 h-5 rounded-full text-xs flex-shrink-0 flex items-center justify-center font-bold mt-0.5"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                {i + 1}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Key input */}
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>
          {t("set_did_label")}
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t("set_did_ph")}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4 font-mono"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        />

        <div className="flex gap-3">
          <button
            onClick={save}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            {saved ? t("set_saved") : t("set_save")}
          </button>
          {hasKey && (
            <button
              onClick={clear}
              className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              {t("set_clear")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
