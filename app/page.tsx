"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/translations";

const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
  .land { font-family: 'Sora', system-ui, sans-serif; }
  @keyframes shimmer {
    0%{background-position:-200% center}100%{background-position:200% center}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}
  }
  .sg {
    background: linear-gradient(90deg,#9a6e00,#f0c040,#d4af37,#f0c040,#9a6e00);
    background-size: 200% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;animation:shimmer 4s linear infinite;
  }
  .a1{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) both}
  .a2{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .14s both}
  .a3{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .28s both}
  .a4{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .42s both}
  .cta-btn:hover{background:#c9a227!important;transform:translateY(-2px);box-shadow:0 12px 36px rgba(212,175,55,.35)!important}
  .cta-btn{transition:all .2s ease}
  .lang-btn{transition:all .2s ease}
  .lang-btn:hover{color:#d4af37!important}
`;

export default function Home() {
  const { t, lang, setLang } = useLanguage();

  const headlines: Record<Lang, { top: string; gold: string; sub: string }> = {
    pt: {
      top: "Vídeos de campanha",
      gold: "em 60 segundos",
      sub: "Grave-se uma vez — e crie vídeos com o seu rosto e a sua voz para qualquer público, apenas com texto.",
    },
    en: {
      top: "Campanha videos",
      gold: "in 60 seconds",
      sub: "Record yourself once — then create videos with your face and voice for any audience, just with text.",
    },
    he: {
      top: "סרטוני קמפיין",
      gold: "תוך 60 שניות",
      sub: "מקליט פעם אחת — יוצר סרטונים עם הפנים והקול שלך לכל קהל, רק עם טקסט.",
    },
  };

  const cta: Record<Lang, string> = {
    pt: "Entrar no app →",
    en: "Open app →",
    he: "כניסה לאפליקציה →",
  };

  const h = headlines[lang] ?? headlines.pt;

  return (
    <>
      <style>{CSS}</style>
      <main dir="ltr" className="land" style={{ background: "#080809", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>

        {/* subtle bg glow */}
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(212,175,55,.06) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* lang switcher */}
        <div className="a1" style={{ position: "absolute", top: 24, right: 28, display: "flex", gap: 6 }}>
          {LANGS.map(l => (
            <button key={l.code} className="lang-btn" onClick={() => setLang(l.code)}
              style={{ background: "none", border: `1px solid ${lang === l.code ? "rgba(212,175,55,.5)" : "rgba(255,255,255,.08)"}`, color: lang === l.code ? "#d4af37" : "#444", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".04em" }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div style={{ textAlign: "center", maxWidth: 640, position: "relative" }}>

          <div className="a1" style={{ marginBottom: 40 }}>
            <span className="sg" style={{ fontSize: "clamp(2.4rem,6vw,3.6rem)", fontWeight: 900, letterSpacing: "-.05em", display: "block", lineHeight: 1 }}>
              Campanha
            </span>
            <span style={{ fontSize: 13, color: "#333", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginTop: 10 }}>
              🇧🇷 &nbsp; AI · Vídeo · Política
            </span>
          </div>

          <h1 className="a2" style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-.05em", marginBottom: 24, color: "#fff" }}>
            {h.top}<br />
            <span className="sg">{h.gold}</span>
          </h1>

          <p className="a3" style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", color: "#555", maxWidth: 480, margin: "0 auto 52px", lineHeight: 1.8, fontWeight: 400 }}>
            {h.sub}
          </p>

          <div className="a4">
            <Link href="/dashboard" className="cta-btn"
              style={{ display: "inline-block", background: "#d4af37", color: "#000", borderRadius: 14, padding: "18px 48px", fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", letterSpacing: "-.02em", boxShadow: "0 4px 20px rgba(212,175,55,.2)" }}>
              {cta[lang] ?? cta.pt}
            </Link>
          </div>

        </div>

      </main>
    </>
  );
}
