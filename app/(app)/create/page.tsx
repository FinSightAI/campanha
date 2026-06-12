"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { scriptToVTT } from "@/lib/subtitles";
import { getDIDHeaders } from "@/lib/didKey";

type VideoStatus = "idle" | "generating" | "done" | "error";
type Tone = "formal" | "warm" | "urgent" | "chat";
type ScriptLen = "short" | "med" | "long";
type SavedScript = { id: string; name: string; text: string; createdAt: string };
type ReviewResult = { strengths: string[]; weaknesses: string[]; suggestion: string };

const SCRIPT_LIMIT = 1000;
const LIB_KEY = "campanha_scripts";
const DRAFT_KEY = "campanha_draft";

const TEMPLATES: Record<string, { label: string; text: string }[]> = {
  en: [
    { label: "🏠 Housing", text: "Dear residents of [city], my name is [name], and I'm running for you. Housing prices have doubled in five years. Our families can't afford to live in the city they grew up in. My plan: 500 affordable housing units in three years, plus direct support for young renters. Together, we'll bring home back to the people." },
    { label: "🚌 Transportation", text: "I understand you — ninety minutes in traffic for a commute that should take twenty. That's not inevitable. My commitment: expanded public transit, 40 km of new bike lanes, and smart parking solutions to cut congestion. When we improve transportation, everyone wins — including the environment." },
    { label: "📚 Education", text: "Our children deserve tomorrow's education. I commit to renovating every outdated classroom, providing computers and AI tools to every student, and raising teacher salaries by fifteen percent. A happy teacher means a successful student. This is the smartest investment we can make for our future." },
    { label: "🛡️ Safety", text: "Personal safety is the foundation for everything else. I commit to lighting every neighborhood, expanding police-community collaboration, and establishing a city cyber-safety unit. When you feel safe in your streets, you can truly live your life to the fullest." },
    { label: "🌳 Environment", text: "Our city is beautiful — and we owe it to our children to keep it that way. I commit to planting one thousand new trees, upgrading five city parks, and launching a recycling program that cuts waste by thirty percent. A green city is a healthy city worth living in." },
  ],
  pt: [
    { label: "🏠 Habitação", text: "Queridos moradores de [cidade], sou [nome] e sou candidato por vocês. Os preços da habitação dobraram em cinco anos. As nossas famílias não conseguem viver na cidade onde cresceram. Meu plano: 500 unidades habitacionais acessíveis em três anos e apoio direto para inquilinos jovens. Juntos, devolveremos o lar ao povo." },
    { label: "🚌 Transporte", text: "Eu entendo vocês — uma hora e meia no trânsito para um trajeto de vinte minutos. Isso não é inevitável. Meu compromisso: mais transporte público, 40 km de novas ciclovias e soluções de estacionamento inteligente. Quando melhoramos o transporte, todos ganham — inclusive o meio ambiente." },
    { label: "📚 Educação", text: "Nossas crianças merecem a educação do amanhã. Me comprometo a renovar cada sala de aula obsoleta, fornecer computadores e ferramentas de IA para cada aluno e aumentar os salários dos professores em quinze por cento. Professor feliz, aluno bem-sucedido. Este é o investimento mais inteligente que podemos fazer." },
    { label: "🛡️ Segurança", text: "A segurança pessoal é a base de tudo. Me comprometo a iluminar todos os bairros, expandir a colaboração polícia-comunidade e criar uma unidade de cibersegurança municipal. Quando vocês se sentirem seguros nas ruas, poderão verdadeiramente viver plenamente." },
    { label: "🌳 Meio Ambiente", text: "Nossa cidade é linda — e devemos preservá-la para nossos filhos. Me comprometo a plantar mil novas árvores, modernizar cinco parques urbanos e lançar um programa de reciclagem que reduz o desperdício em trinta por cento. Uma cidade verde é uma cidade saudável que vale a pena viver." },
  ],
};

const AUDIENCE_PRESETS: { pt: string; en: string; he: string; icon: string }[] = [
  { icon: "👴", pt: "Idosos", en: "Seniors", he: "ותיקים" },
  { icon: "🎓", pt: "Jovens", en: "Youth", he: "צעירים" },
  { icon: "👨‍👩‍👧", pt: "Pais", en: "Parents", he: "הורים" },
  { icon: "💼", pt: "Empresários", en: "Business", he: "עסקים" },
  { icon: "👩", pt: "Mulheres", en: "Women", he: "נשים" },
];

const TONES: { key: Tone; pt: string; en: string; he: string }[] = [
  { key: "formal", pt: "Formal", en: "Formal", he: "רשמי" },
  { key: "warm", pt: "Caloroso", en: "Warm", he: "חמים" },
  { key: "urgent", pt: "Urgente", en: "Urgent", he: "דחוף" },
  { key: "chat", pt: "Descontraído", en: "Conversational", he: "שיחתי" },
];

const LENGTHS: { key: ScriptLen; pt: string; en: string; he: string }[] = [
  { key: "short", pt: "30 seg", en: "30 sec", he: "30 שנ" },
  { key: "med", pt: "1 min", en: "1 min", he: "דקה" },
  { key: "long", pt: "2 min", en: "2 min", he: "2 דק" },
];

function waMessage(name: string, url: string, lang: string) {
  if (lang === "en") return `Hi! I'm ${name} and I'd like to share my campaign message.\n\n🎥 ${url}\n\nYour voice matters — count on my support!`;
  if (lang === "he") return `שלום! אני ${name} ואני רוצה לשתף אתכם במסרון הקמפיין שלי.\n\n🎥 ${url}\n\nקולכם חשוב — סמכו עליי!`;
  return `Olá! Sou ${name} e quero compartilhar minha mensagem de campanha com você.\n\n🎥 ${url}\n\nJuntos, podemos fazer mais pela nossa cidade. Conte comigo!`;
}

function CreatePageInner() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();

  // Core state
  const [script, setScript] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedWA, setCopiedWA] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // UI toggles
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [bgUrl, setBgUrl] = useState("");

  // AI writer
  const [showAI, setShowAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiTone, setAiTone] = useState<Tone>("warm");
  const [aiLen, setAiLen] = useState<ScriptLen>("med");
  const [aiWriting, setAiWriting] = useState(false);
  const [aiError, setAiError] = useState("");

  // Script reviewer
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewError, setReviewError] = useState("");

  // Script library
  const [showLib, setShowLib] = useState(false);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [libSaved, setLibSaved] = useState(false);

  // Tracking
  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackCreating, setTrackCreating] = useState(false);
  const [copiedTrack, setCopiedTrack] = useState(false);

  // Draft
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [vttUrl, setVttUrl] = useState<string | null>(null);
  const prevVttUrl = useRef<string | null>(null);

  useEffect(() => {
    setAvatarId(localStorage.getItem("campanha_avatar_id"));
    setVoiceId(localStorage.getItem("campanha_avatar_voice_id"));
    setAvatarName(localStorage.getItem("campanha_avatar_name") || "");
    setThumbnailUrl(localStorage.getItem("campanha_avatar_thumbnail") || "");
    // Pre-fill from calendar
    const topic = searchParams.get("topic") || "";
    const audience = searchParams.get("audience") || "";
    if (topic) { setAiTopic(topic); setAiAudience(audience); setShowAI(true); }
    // Load library
    try { setSavedScripts(JSON.parse(localStorage.getItem(LIB_KEY) || "[]")); } catch { /* ignore */ }
    // Check for saved draft
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && draft.length > 10 && !topic) setShowDraftBanner(true);
  }, [searchParams]);

  async function createTrackingLink(url: string) {
    setTrackCreating(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrackId(data.id);
        try {
          const vids = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
          if (vids[0] && !vids[0].trackId) { vids[0].trackId = data.id; localStorage.setItem("campanha_videos", JSON.stringify(vids)); }
        } catch { /* ignore */ }
      }
    } catch { /* silent fail */ } finally {
      setTrackCreating(false);
    }
  }

  useEffect(() => {
    if (status === "done" && videoUrl && script) {
      if (prevVttUrl.current) URL.revokeObjectURL(prevVttUrl.current);
      const vtt = scriptToVTT(script);
      const blob = new Blob([vtt], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      prevVttUrl.current = url;
      setVttUrl(url);
      createTrackingLink(videoUrl);
    } else {
      setVttUrl(null);
    }
  }, [status, videoUrl, script]);

  async function writeWithAI() {
    if (!aiTopic.trim()) return;
    setAiWriting(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, audience: aiAudience, lang, tone: aiTone, length: aiLen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.script);
      setShowAI(false);
      setReview(null);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : t("crt_ai_err"));
    } finally {
      setAiWriting(false);
    }
  }

  async function reviewScript() {
    if (!script.trim()) return;
    setReviewing(true);
    setReviewError("");
    setReview(null);
    try {
      const res = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReview(data);
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : "Error");
    } finally {
      setReviewing(false);
    }
  }

  function saveToLibrary() {
    const name = script.trim().split(/\s+/).slice(0, 5).join(" ") + "…";
    const entry: SavedScript = { id: Math.random().toString(36).slice(2), name, text: script, createdAt: new Date().toISOString() };
    const updated = [entry, ...savedScripts].slice(0, 20);
    setSavedScripts(updated);
    localStorage.setItem(LIB_KEY, JSON.stringify(updated));
    setLibSaved(true);
    setTimeout(() => setLibSaved(false), 2000);
  }

  function loadFromLibrary(entry: SavedScript) {
    setScript(entry.text);
    setShowLib(false);
    setReview(null);
  }

  function deleteFromLibrary(id: string) {
    const updated = savedScripts.filter((s) => s.id !== id);
    setSavedScripts(updated);
    localStorage.setItem(LIB_KEY, JSON.stringify(updated));
  }

  async function generate() {
    if (!script.trim() || !avatarId) return;
    setStatus("generating");
    setError("");
    setVideoUrl(null);
    setVttUrl(null);
    setTrackId(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ script: script.trim(), avatarId, voiceId, bgUrl: bgUrl.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("err_unknown"));
      pollStatus(data.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("err_unknown"));
      setStatus("error");
    }
  }

  async function pollStatus(id: string) {
    const MAX = 60;
    let attempts = 0;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX) { clearInterval(pollRef.current!); setError(t("err_timeout")); setStatus("error"); return; }
      try {
        const res = await fetch(`/api/status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") { clearInterval(pollRef.current!); setVideoUrl(data.result_url); setStatus("done"); saveVideo(id, data.result_url, script); }
        else if (data.status === "error") { clearInterval(pollRef.current!); setError(t("err_ai")); setStatus("error"); }
      } catch { /* keep polling */ }
    }, 3000);
  }

  function saveVideo(id: string, url: string, text: string) {
    const videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    const name = text.trim().split(/\s+/).slice(0, 6).join(" ");
    videos.unshift({ id, url, script: text.substring(0, 80), name, createdAt: new Date().toISOString() });
    localStorage.setItem("campanha_videos", JSON.stringify(videos.slice(0, 100)));
    localStorage.removeItem(DRAFT_KEY);
  }

  function reset() { setStatus("idle"); setVideoUrl(null); setError(""); setVttUrl(null); setTrackId(null); setReview(null); }

  async function shareNative(url: string) {
    const text = waMessage(avatarName, url, lang);
    if (navigator.share) {
      try { await navigator.share({ text, url }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(url);
    setCopiedTrack(true);
    setTimeout(() => setCopiedTrack(false), 2000);
  }

  async function copyWA() {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(waMessage(avatarName, trackUrl || videoUrl, lang));
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  }

  async function copyTrackLink() {
    if (!trackUrl) return;
    await navigator.clipboard.writeText(trackUrl);
    setCopiedTrack(true);
    setTimeout(() => setCopiedTrack(false), 2000);
  }

  const charCount = script.length;
  const charPct = Math.min(charCount / SCRIPT_LIMIT, 1);
  const charColor = charCount > SCRIPT_LIMIT * 0.9 ? "#e55" : charCount > SCRIPT_LIMIT * 0.7 ? "#d4af37" : "var(--muted)";

  const trackUrl = trackId ? `${typeof window !== "undefined" ? window.location.origin : ""}/v/${trackId}` : null;

  if (!avatarId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64 text-center">
        <p className="text-2xl mb-2">◉</p>
        <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{t("crt_no_avatar_title")}</p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t("crt_no_avatar_hint")}</p>
        <Link href="/avatar" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--gold)", color: "#000" }}>
          {t("crt_go_avatar")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("crt_title")}</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{t("crt_subtitle")}</p>

      {/* Avatar badge */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className="text-xl" style={{ color: "var(--gold)" }}>◉</span>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{avatarName}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>V3 Instant Avatar · {voiceId ? t("crt_voice_cloned") : t("crt_voice_tts")}</p>
        </div>
        <Link href="/avatar" className="text-xs underline" style={{ color: "var(--muted)" }}>{t("crt_replace")}</Link>
      </div>

      {/* AI Writer */}
      <button
        onClick={() => setShowAI((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-3 text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: "var(--card)", border: `1px solid ${showAI ? "var(--gold)" : "var(--border)"}`, color: showAI ? "var(--gold)" : "var(--text)" }}
      >
        <span>{t("crt_ai_label")}</span>
        <span style={{ color: "var(--gold)" }}>{showAI ? "▲" : "▼"}</span>
      </button>

      {showAI && (
        <div className="rounded-xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--gold)" }}>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>{t("crt_ai_topic")}</label>
            <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder={t("crt_ai_topic_ph")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>{t("crt_ai_audience")}</label>
            <input type="text" value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} placeholder={t("crt_ai_audience_ph")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <div className="flex gap-1.5 flex-wrap">
              {AUDIENCE_PRESETS.map((p) => {
                const label = (p as Record<string, string>)[lang] ?? p.pt;
                const active = aiAudience === label;
                return (
                  <button key={p.icon} onClick={() => setAiAudience(active ? "" : label)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={{ background: active ? "var(--gold)" : "var(--bg)", color: active ? "#000" : "var(--muted)", border: `1px solid ${active ? "var(--gold)" : "var(--border)"}` }}>
                    {p.icon} {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("crt_tone_label")}</label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map((tn) => (
                <button key={tn.key} onClick={() => setAiTone(tn.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: aiTone === tn.key ? "var(--gold)" : "var(--bg)", color: aiTone === tn.key ? "#000" : "var(--muted)", border: `1px solid ${aiTone === tn.key ? "var(--gold)" : "var(--border)"}` }}>
                  {(tn as Record<string, string>)[lang] ?? tn.pt}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted)" }}>{t("crt_len_label")}</label>
            <div className="flex gap-2">
              {LENGTHS.map((ln) => (
                <button key={ln.key} onClick={() => setAiLen(ln.key)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: aiLen === ln.key ? "var(--gold)" : "var(--bg)", color: aiLen === ln.key ? "#000" : "var(--muted)", border: `1px solid ${aiLen === ln.key ? "var(--gold)" : "var(--border)"}` }}>
                  {(ln as Record<string, string>)[lang] ?? ln.pt}
                </button>
              ))}
            </div>
          </div>
          {aiError && <p className="text-xs mb-2" style={{ color: "#e55" }}>{aiError}</p>}
          <button onClick={writeWithAI} disabled={!aiTopic.trim() || aiWriting}
            className="w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}>
            {aiWriting ? t("crt_ai_writing") : t("crt_ai_write")}
          </button>
        </div>
      )}

      {/* Script label row */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t("crt_script_label")}</label>
        <div className="flex gap-2">
          <button onClick={() => setShowLib((v) => !v)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--card)", border: `1px solid ${showLib ? "var(--gold)" : "var(--border)"}`, color: showLib ? "var(--gold)" : "var(--muted)" }}>
            📚 {t("lib_title")} {savedScripts.length > 0 && `(${savedScripts.length})`}
          </button>
          <button onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}>
            ✦ {t("crt_tpl_btn")}
          </button>
        </div>
      </div>

      {/* Library panel */}
      {showLib && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--gold)" }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ background: "var(--bg)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{t("lib_title")}</p>
            <button onClick={saveToLibrary} disabled={script.trim().length < 10}
              className="text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-40 transition-colors"
              style={{ background: libSaved ? "var(--gold)" : "var(--border)", color: libSaved ? "#000" : "var(--muted)" }}>
              {libSaved ? t("lib_saved") : `💾 ${t("lib_save")}`}
            </button>
          </div>
          {savedScripts.length === 0 ? (
            <p className="px-3 py-4 text-xs text-center" style={{ background: "var(--card)", color: "var(--muted)" }}>{t("lib_empty")}</p>
          ) : (
            savedScripts.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2.5" style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
                <p className="flex-1 text-xs truncate" style={{ color: "var(--text)" }}>{s.name}</p>
                <button onClick={() => loadFromLibrary(s)} className="text-xs font-bold px-2 py-1 rounded"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {t("lib_load")}
                </button>
                <button onClick={() => deleteFromLibrary(s.id)} className="text-xs px-1.5 py-1 rounded transition-opacity hover:opacity-60"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Templates dropdown */}
      {showTemplates && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <p className="text-xs px-3 py-2 font-semibold" style={{ background: "var(--bg)", color: "var(--muted)" }}>{t("crt_tpl_pick")}</p>
          {(TEMPLATES[lang] ?? TEMPLATES.en).map((tpl) => (
            <button key={tpl.label} onClick={() => { setScript(tpl.text); setShowTemplates(false); setReview(null); }}
              className="w-full text-start px-3 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ background: "var(--card)", color: "var(--text)", borderTop: "1px solid var(--border)" }}>
              {tpl.label}
            </button>
          ))}
        </div>
      )}

      {/* Draft restore banner */}
      {showDraftBanner && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-3" style={{ background: "var(--card)", border: "1px solid rgba(212,175,55,.4)" }}>
          <span style={{ color: "var(--gold)" }}>📝</span>
          <p className="flex-1 text-xs" style={{ color: "var(--text)" }}>{t("crt_draft_banner")}</p>
          <button onClick={() => { setScript(localStorage.getItem(DRAFT_KEY) || ""); setShowDraftBanner(false); }}
            className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "var(--gold)", color: "#000" }}>
            {t("crt_draft_restore")}
          </button>
          <button onClick={() => { localStorage.removeItem(DRAFT_KEY); setShowDraftBanner(false); }}
            className="text-xs" style={{ color: "var(--muted)" }}>
            {t("crt_draft_dismiss")}
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="mb-2">
        <textarea value={script} onChange={(e) => { setScript(e.target.value); setReview(null); localStorage.setItem(DRAFT_KEY, e.target.value); }}
          placeholder={t("crt_script_placeholder")} rows={6} disabled={status === "generating"}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "var(--card)", border: `1px solid ${charCount > SCRIPT_LIMIT * 0.9 ? "#e55" : "var(--border)"}`, color: "var(--text)" }} />
        <div className="mt-1.5 mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs" style={{ color: charColor }}>{charCount} / {SCRIPT_LIMIT} {t("crt_chars_left")}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(charPct * 100, 100)}%`, background: charCount > SCRIPT_LIMIT * 0.9 ? "#e55" : charCount > SCRIPT_LIMIT * 0.7 ? "#d4af37" : "var(--gold)" }} />
          </div>
        </div>
      </div>

      {/* AI Reviewer */}
      {(status === "idle" || status === "error") && charCount > 50 && (
        <div className="mb-4">
          <button onClick={reviewScript} disabled={reviewing}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}>
            {reviewing ? t("crt_review_loading") : t("crt_review_btn")}
          </button>

          {reviewError && <p className="text-xs mt-2" style={{ color: "#e55" }}>{reviewError}</p>}

          {review && (
            <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,.3)" }}>
              <div className="grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
                <div className="p-3" style={{ background: "var(--card)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--gold)" }}>{t("crt_review_strengths")}</p>
                  <ul className="space-y-1">
                    {review.strengths.map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3" style={{ background: "var(--card)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#d4af37" }}>{t("crt_review_weak")}</p>
                  <ul className="space-y-1">
                    {review.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-3" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "var(--gold)" }}>{t("crt_review_suggest")}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{review.suggestion}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Script preview */}
      {(status === "idle" || status === "error") && script.trim().length > 10 && (() => {
        const words = script.trim().split(/\s+/).length;
        const estMin = Math.round(words / 130) || 1;
        return (
          <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "var(--card)", border: "1px solid rgba(212,175,55,.25)" }}>
            {thumbnailUrl ? <img src={thumbnailUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              : <span className="text-xl flex-shrink-0" style={{ color: "var(--gold)" }}>◉</span>}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--gold)" }}>{t("crt_preview_title")}</p>
              <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{script.trim().substring(0, 90)}{script.trim().length > 90 ? "…" : ""}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{estMin}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{t("crt_est_min")}</p>
            </div>
          </div>
        );
      })()}

      {/* Background image */}
      {(status === "idle" || status === "error") && (
        <div className="mb-4">
          <button onClick={() => setShowBg((v) => !v)}
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}>
            <span style={{ color: showBg ? "var(--gold)" : "var(--muted)" }}>◆</span>
            {t("crt_bg_label")} {showBg ? "▲" : "▼"}
          </button>
          {showBg && (
            <input type="url" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)}
              placeholder={t("crt_bg_ph")}
              className="w-full mt-2 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} />
          )}
        </div>
      )}

      {/* Generate */}
      {(status === "idle" || status === "error") && (
        <button onClick={generate} disabled={!script.trim() || charCount > SCRIPT_LIMIT}
          className="w-full py-4 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{ background: "var(--gold)", color: "#000" }}>
          {t("crt_generate")}
        </button>
      )}

      {status === "generating" && (
        <div className="w-full py-4 rounded-xl text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <span className="animate-pulse" style={{ color: "var(--gold)" }}>{t("crt_generating")}</span>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("crt_generating_wait")}</p>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-3">
          <p className="text-sm flex-1" style={{ color: "#e55" }}>{error}</p>
          <button onClick={generate} disabled={!script.trim()}
            className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 disabled:opacity-40"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}>
            {t("crt_retry")}
          </button>
        </div>
      )}

      {/* Result */}
      {status === "done" && videoUrl && (
        <div className="mt-6">
          <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "linear-gradient(135deg,rgba(212,175,55,.13),rgba(212,175,55,.04))", border: "1px solid rgba(212,175,55,.4)" }}>
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-bold mb-1" style={{ color: "var(--gold)" }}>{t("crt_done_title")}</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{t("crt_done_sub")}</p>
          </div>

          <div className="rounded-xl overflow-hidden mb-2" style={{ border: "1px solid var(--border)" }}>
            <video src={videoUrl} controls className="w-full">
              {vttUrl && subtitlesOn && <track kind="subtitles" src={vttUrl} default label={t("crt_subtitles")} />}
            </video>
          </div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setSubtitlesOn(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{ background: subtitlesOn ? "rgba(212,175,55,.15)" : "var(--card)", border: `1px solid ${subtitlesOn ? "var(--gold)" : "var(--border)"}`, color: subtitlesOn ? "var(--gold)" : "var(--muted)" }}>
              CC {subtitlesOn ? "✓" : "✕"} {t("crt_sub_toggle")}
            </button>
          </div>

          {/* Tracking link */}
          {(trackCreating || trackUrl) && (
            <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--gold)" }}>🔗 {t("crt_track_label")}</p>
                {trackCreating ? (
                  <p className="text-xs animate-pulse" style={{ color: "var(--muted)" }}>
                    {lang === "pt" ? "Criando link..." : lang === "en" ? "Creating link..." : "יוצר קישור..."}
                  </p>
                ) : (
                  <p className="text-xs truncate font-mono" style={{ color: "var(--muted)" }}>{trackUrl}</p>
                )}
              </div>
              {trackUrl && (
                <button onClick={copyTrackLink} disabled={trackCreating}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: copiedTrack ? "var(--gold)" : "var(--border)", color: copiedTrack ? "#000" : "var(--muted)" }}>
                  {copiedTrack ? "✓" : t("crt_track_copy").split(" ")[0]}
                </button>
              )}
            </div>
          )}

          {/* Share buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(trackUrl || videoUrl)}`} target="_blank" rel="noopener noreferrer"
                className="py-3.5 rounded-xl text-sm font-bold text-center" style={{ background: "#25D366", color: "#fff" }}>
                {t("crt_share_wa")}
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(trackUrl || videoUrl)}`} target="_blank" rel="noopener noreferrer"
                className="py-3.5 rounded-xl text-sm font-bold text-center" style={{ background: "#0088cc", color: "#fff" }}>
                {t("crt_share_tg")}
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackUrl || videoUrl)}`} target="_blank" rel="noopener noreferrer"
                className="py-3.5 rounded-xl text-sm font-bold text-center" style={{ background: "#1877F2", color: "#fff" }}>
                Facebook
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackUrl || videoUrl)}`} target="_blank" rel="noopener noreferrer"
                className="py-3.5 rounded-xl text-sm font-bold text-center" style={{ background: "#0A66C2", color: "#fff" }}>
                LinkedIn
              </a>
            </div>
            <button onClick={copyWA} className="w-full py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: copiedWA ? "#25D366" : "var(--card)", color: copiedWA ? "#fff" : "var(--text)", border: `1px solid ${copiedWA ? "#25D366" : "var(--border)"}` }}>
              {copiedWA ? t("crt_wa_copied") : `📋 ${t("crt_wa_copy")}`}
            </button>
            <div className="flex gap-3">
              <button onClick={() => shareNative((trackUrl || videoUrl) as string)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                📤 {t("crt_share_native")}
              </button>
              <a href={videoUrl} download className="flex-1 py-3 rounded-xl text-sm font-bold text-center" style={{ background: "var(--gold)", color: "#000" }}>
                {t("crt_download")}
              </a>
              <button onClick={reset} className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {t("crt_create_more")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  );
}
