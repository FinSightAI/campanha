"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { getAppHeaders } from "@/lib/didKey";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type ClerkUser = { fullName: string | null; primaryEmailAddress: { emailAddress: string } | null; imageUrl: string };

function ProfileWithClerk({ onUser }: { onUser: (u: ClerkUser | null) => void }) {
  const { useUser, SignInButton, SignOutButton } = require("@clerk/nextjs");
  const { user, isLoaded } = useUser();

  useEffect(() => { onUser(isLoaded ? user : null); }, [user, isLoaded]);

  if (!isLoaded) return <div className="h-12 animate-pulse rounded-xl" style={{ background: "var(--border)" }} />;

  if (!user) {
    return (
      <SignInButton mode="modal">
        <button
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Conectar com Google
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid rgba(212,175,55,.4)" }}>
      {user.imageUrl && (
        <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{user.fullName}</p>
        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.primaryEmailAddress?.emailAddress}</p>
      </div>
      <SignOutButton>
        <button className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
          Sair
        </button>
      </SignOutButton>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const [clerkUser, setClerkUser] = useState<ClerkUser | null>(null);

  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [party, setParty] = useState("");
  const [topics, setTopics] = useState("");
  const [speeches, setSpeeches] = useState("");
  const [styleAnalysis, setStyleAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("campanha_profile_role") || "");
    setCity(localStorage.getItem("campanha_profile_city") || "");
    setParty(localStorage.getItem("campanha_profile_party") || "");
    setTopics(localStorage.getItem("campanha_profile_topics") || "");
    setSpeeches(localStorage.getItem("campanha_profile_speeches") || "");
    setStyleAnalysis(localStorage.getItem("campanha_profile_style") || "");
  }, []);

  function handleClerkUser(u: ClerkUser | null) {
    setClerkUser(u);
    if (u?.fullName && !role) setRole(u.fullName);
  }

  function saveProfile() {
    localStorage.setItem("campanha_profile_role", role.trim());
    localStorage.setItem("campanha_profile_city", city.trim());
    localStorage.setItem("campanha_profile_party", party.trim());
    localStorage.setItem("campanha_profile_topics", topics.trim());
    localStorage.setItem("campanha_profile_speeches", speeches);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function analyzeSpeeches() {
    if (!speeches.trim()) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/analyze-speeches", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAppHeaders() },
        body: JSON.stringify({ speeches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStyleAnalysis(data.analysis);
      localStorage.setItem("campanha_profile_style", data.analysis);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Error");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("prof_title")}</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("prof_subtitle")}</p>
      </div>

      {/* Google sign-in section */}
      {CLERK_ENABLED && (
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
            {clerkUser ? t("prof_connected_as") : t("prof_connect_google")}
          </p>
          <ProfileWithClerk onUser={handleClerkUser} />
        </div>
      )}

      {/* Personal info */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{t("prof_info_title")}</h2>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("prof_name_label")}</label>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder={t("prof_name_ph")}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("prof_city_label")}</label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder={t("prof_city_ph")}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("prof_party_label")}</label>
          <input value={party} onChange={e => setParty(e.target.value)} placeholder={t("prof_party_ph")}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("prof_topics_label")}</label>
          <input value={topics} onChange={e => setTopics(e.target.value)} placeholder={t("prof_topics_ph")}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      {/* Speech style analysis */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div>
          <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--text)" }}>{t("prof_speeches_label")}</h2>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{t("prof_speeches_hint")}</p>
        </div>

        <textarea value={speeches} onChange={e => setSpeeches(e.target.value)}
          placeholder="Cole seus discursos aqui..."
          rows={6}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />

        {analyzeError && <p className="text-xs" style={{ color: "#e55" }}>{analyzeError}</p>}

        <button onClick={analyzeSpeeches} disabled={!speeches.trim() || analyzing}
          className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
          style={{ background: "var(--gold)", color: "#000" }}>
          {analyzing ? t("prof_analyzing") : t("prof_analyze")}
        </button>

        {styleAnalysis && (
          <div className="rounded-xl p-4" style={{ background: "var(--bg)", border: "1px solid rgba(212,175,55,.3)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--gold)" }}>{t("prof_style_title")}</p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--muted)" }}>{styleAnalysis}</p>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="space-y-3">
        <button onClick={saveProfile}
          className="w-full py-3.5 rounded-xl font-bold text-sm"
          style={{ background: saved ? "#22c55e" : "var(--gold)", color: "#000" }}>
          {saved ? t("prof_saved") : t("prof_save")}
        </button>
        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>{t("prof_ai_note")}</p>
      </div>
    </div>
  );
}
