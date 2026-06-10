"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { scriptToVTT } from "@/lib/subtitles";
import { getDIDHeaders } from "@/lib/didKey";
import type { Lang } from "@/lib/translations";

type VideoStatus = "idle" | "generating" | "done" | "error";

const TEMPLATES: Record<Lang, { label: string; text: string }[]> = {
  he: [
    { label: "🏠 דיור", text: "תושבי [עיר] היקרים, שמי [שם], ואני רץ עבורכם. מחירי הדיור עלו פי שניים בחמש שנים האחרונות. המשפחות שלנו לא יכולות לגור בעיר שהם גדלו בה. התוכנית שלי: 500 יחידות דיור בר-השגה תוך שלוש שנים, ותמיכה ישירה לדיירים צעירים. יחד נחזיר את הבית לידי העם." },
    { label: "🚌 תחבורה", text: "אני מבין אתכם — שעה וחצי בפקק לעבודה שצריכה לקחת עשרים דקות. זה לא גזרה משמיים. ההתחייבות שלי: הרחבת קווי הציבורי, ארבעים קילומטר שבילי אופניים חדשים, ופתרונות חניה שיורידו עומסים. כשנשפר את התחבורה, כולנו נרוויח — כולל הסביבה." },
    { label: "📚 חינוך", text: "ילדינו ראויים לחינוך של מחר. אני [שם], ומתחייב לשפץ כל כיתה ישנה, לתת מחשב וכלי AI לכל תלמיד, ולהעלות משכורות מורים בחמישה-עשר אחוז. מורה מאושר — תלמיד מצליח. זו ההשקעה הכי חכמה שנוכל לעשות לעתיד שלנו." },
    { label: "🛡️ ביטחון", text: "ביטחון אישי הוא הבסיס לכל השאר. אני מתחייב להוסיף תאורת רחוב בכל שכונה, להרחיב שיתוף פעולה בין משטרה וקהילה, ולהקים יחידת סייבר עירונית. כשתרגישו בטוחים ברחובות שלכם — תוכלו לחיות את חייכם במלואם." },
    { label: "🌳 סביבה", text: "העיר שלנו יפה — ואנחנו חייבים לשמור עליה לילדינו. אני מתחייב: אלף עצים חדשים, חמישה פארקים עירוניים משודרגים, ותכנית מחזור שתחסוך שלושים אחוז פסולת. עיר ירוקה היא עיר בריאה ושווה לחיות בה." },
  ],
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

export default function CreatePage() {
  const { t, lang } = useLanguage();
  const [script, setScript] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  // AI writer
  const [showAI, setShowAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiWriting, setAiWriting] = useState(false);
  const [aiError, setAiError] = useState("");
  // subtitles
  const [vttUrl, setVttUrl] = useState<string | null>(null);
  const prevVttUrl = useRef<string | null>(null);

  useEffect(() => {
    setAvatarId(localStorage.getItem("campanha_avatar_id"));
    setVoiceId(localStorage.getItem("campanha_avatar_voice_id"));
    setAvatarName(localStorage.getItem("campanha_avatar_name") || "");
    setThumbnailUrl(localStorage.getItem("campanha_avatar_thumbnail") || "");
  }, []);

  // Build VTT whenever a video is ready
  useEffect(() => {
    if (status === "done" && videoUrl && script) {
      if (prevVttUrl.current) URL.revokeObjectURL(prevVttUrl.current);
      const vtt = scriptToVTT(script);
      const blob = new Blob([vtt], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      prevVttUrl.current = url;
      setVttUrl(url);
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
        body: JSON.stringify({ topic: aiTopic, audience: aiAudience, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.script);
      setShowAI(false);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : t("crt_ai_err"));
    } finally {
      setAiWriting(false);
    }
  }

  async function generate() {
    if (!script.trim() || !avatarId) return;
    setStatus("generating");
    setError("");
    setVideoUrl(null);
    setVttUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ script: script.trim(), avatarId, voiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה ביצירת הוידאו");
      pollStatus(data.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("err_unknown"));
      setStatus("error");
    }
  }

  async function pollStatus(id: string) {
    const MAX = 60;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(interval);
        setError(t("err_timeout"));
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`/api/status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(interval);
          setVideoUrl(data.result_url);
          setStatus("done");
          saveVideo(id, data.result_url, script);
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(t("err_ai"));
          setStatus("error");
        }
      } catch { /* keep polling */ }
    }, 3000);
  }

  function saveVideo(id: string, url: string, text: string) {
    const videos = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
    videos.unshift({ id, url, script: text.substring(0, 80), createdAt: new Date().toISOString() });
    localStorage.setItem("campanha_videos", JSON.stringify(videos.slice(0, 100)));
  }

  function reset() {
    setStatus("idle");
    setVideoUrl(null);
    setError("");
    setVttUrl(null);
  }

  async function copyLink() {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            V3 Instant Avatar · {voiceId ? t("crt_voice_cloned") : t("crt_voice_tts")}
          </p>
        </div>
        <Link href="/avatar" className="text-xs underline" style={{ color: "var(--muted)" }}>{t("crt_replace")}</Link>
      </div>

      {/* AI Writer toggle */}
      <button
        onClick={() => setShowAI((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-3 text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: "var(--card)", border: `1px solid ${showAI ? "var(--gold)" : "var(--border)"}`, color: showAI ? "var(--gold)" : "var(--text)" }}
      >
        <span>{t("crt_ai_label")}</span>
        <span style={{ color: "var(--gold)" }}>{showAI ? "▲" : "▼"}</span>
      </button>

      {/* AI Writer panel */}
      {showAI && (
        <div className="rounded-xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--gold)" }}>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>{t("crt_ai_topic")}</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder={t("crt_ai_topic_ph")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>{t("crt_ai_audience")}</label>
            <input
              type="text"
              value={aiAudience}
              onChange={(e) => setAiAudience(e.target.value)}
              placeholder={t("crt_ai_audience_ph")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
          {aiError && <p className="text-xs mb-2" style={{ color: "#e55" }}>{aiError}</p>}
          <button
            onClick={writeWithAI}
            disabled={!aiTopic.trim() || aiWriting}
            className="w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            {aiWriting ? t("crt_ai_writing") : t("crt_ai_write")}
          </button>
        </div>
      )}

      {/* Script label + templates toggle */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t("crt_script_label")}</label>
        <button
          onClick={() => setShowTemplates((v) => !v)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--gold)" }}
        >
          ✦ {t("crt_tpl_btn")}
        </button>
      </div>

      {/* Templates dropdown */}
      {showTemplates && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <p className="text-xs px-3 py-2 font-semibold" style={{ background: "var(--bg)", color: "var(--muted)" }}>
            {t("crt_tpl_pick")}
          </p>
          {TEMPLATES[lang].map((tpl) => (
            <button
              key={tpl.label}
              onClick={() => { setScript(tpl.text); setShowTemplates(false); }}
              className="w-full text-start px-3 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ background: "var(--card)", color: "var(--text)", borderTop: "1px solid var(--border)" }}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}

      {/* Script textarea */}
      <div className="mb-6">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder={t("crt_script_placeholder")}
          rows={6}
          disabled={status === "generating"}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <p className="text-xs mt-1 text-left" style={{ color: "var(--muted)" }}>{script.length} {t("crt_chars")}</p>
      </div>

      {/* Generate */}
      {(status === "idle" || status === "error") && (
        <button
          onClick={generate}
          disabled={!script.trim()}
          className="w-full py-4 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          {t("crt_generate")}
        </button>
      )}

      {status === "generating" && (
        <div className="w-full py-4 rounded-xl text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <span className="animate-pulse" style={{ color: "var(--gold)" }}>{t("crt_generating")}</span>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("crt_generating_wait")}</p>
        </div>
      )}

      {error && <p className="text-sm mt-3" style={{ color: "#e55" }}>{error}</p>}

      {/* Result */}
      {status === "done" && videoUrl && (
        <div className="mt-6 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <video src={videoUrl} controls className="w-full">
            {vttUrl && <track kind="subtitles" src={vttUrl} default label={t("crt_subtitles")} />}
          </video>
          <div className="p-4 space-y-3" style={{ background: "var(--card)" }}>
            <div className="flex gap-3">
              <a href={videoUrl} download className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center" style={{ background: "var(--gold)", color: "#000" }}>
                {t("crt_download")}
              </a>
              <button onClick={reset} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {t("crt_create_more")}
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>{t("crt_share_title")}</p>
              <div className="flex gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(videoUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-center" style={{ background: "#25D366", color: "#fff" }}>
                  {t("crt_share_wa")}
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(videoUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-center" style={{ background: "#0088cc", color: "#fff" }}>
                  {t("crt_share_tg")}
                </a>
                <button onClick={copyLink}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors"
                  style={{ background: copied ? "var(--gold)" : "var(--bg)", color: copied ? "#000" : "var(--text)", border: "1px solid var(--border)" }}>
                  {copied ? t("crt_copied") : t("crt_copy_link")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
