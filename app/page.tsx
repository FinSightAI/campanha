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
  .a5{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .56s both}
  .a6{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .70s both}
  .cta-btn:hover{background:#c9a227!important;transform:translateY(-2px);box-shadow:0 12px 36px rgba(212,175,55,.35)!important}
  .cta-btn{transition:all .2s ease}
  .lang-btn{transition:all .2s ease}
  .lang-btn:hover{color:#d4af37!important}
  .feat-card{transition:transform .2s ease,border-color .2s ease}
  .feat-card:hover{transform:translateY(-4px);border-color:rgba(212,175,55,.4)!important}
`;

const CONTENT: Record<string, {
  top: string; gold: string; sub: string; cta: string;
  howTitle: string;
  steps: { icon: string; title: string; desc: string }[];
  featTitle: string;
  feats: { icon: string; title: string; desc: string }[];
  note: string;
}> = {
  pt: {
    top: "Vídeos de campanha",
    gold: "em 60 segundos",
    sub: "Grave-se uma vez — e crie vídeos com o seu rosto e a sua voz para qualquer público, apenas com texto.",
    cta: "Começar agora — grátis →",
    howTitle: "Como funciona",
    steps: [
      { icon: "🎬", title: "Crie seu avatar", desc: "Grave um vídeo de 1 minuto. A IA aprende seu rosto e voz. Feito uma única vez." },
      { icon: "✍️", title: "Escreva ou peça à IA", desc: "Digite o discurso ou peça à IA para escrever por tema e público em segundos." },
      { icon: "📤", title: "Compartilhe", desc: "Receba o vídeo pronto em 60 segundos. Compartilhe no WhatsApp, Facebook e Instagram." },
    ],
    featTitle: "Tudo que você precisa para uma campanha digital",
    feats: [
      { icon: "⚡", title: "Campanha × 5", desc: "Um tema → 5 vídeos para 5 públicos diferentes simultaneamente" },
      { icon: "📅", title: "Calendário", desc: "Planeje sua agenda de vídeos com antecedência" },
      { icon: "📊", title: "Análises", desc: "Veja quantas pessoas assistiram cada vídeo" },
      { icon: "🤖", title: "Roteirista IA", desc: "Tom formal, caloroso, urgente ou descontraído. Curto, médio ou longo." },
      { icon: "🔗", title: "Links rastreáveis", desc: "Cada vídeo tem um link único com contador de visualizações" },
      { icon: "📱", title: "Mobile-ready", desc: "Funciona no celular — crie e compartilhe de onde estiver" },
    ],
    note: "Sem cartão de crédito · Começa grátis",
  },
  en: {
    top: "Campaign videos",
    gold: "in 60 seconds",
    sub: "Record yourself once — then create videos with your face and voice for any audience, just with text.",
    cta: "Get started — free →",
    howTitle: "How it works",
    steps: [
      { icon: "🎬", title: "Create your avatar", desc: "Record a 1-minute video. AI learns your face and voice. Done only once." },
      { icon: "✍️", title: "Write or ask AI", desc: "Type your speech or let AI write it by topic and audience in seconds." },
      { icon: "📤", title: "Share", desc: "Get your video ready in 60 seconds. Share on WhatsApp, Facebook and Instagram." },
    ],
    featTitle: "Everything you need for a digital campaign",
    feats: [
      { icon: "⚡", title: "Campaign × 5", desc: "One topic → 5 videos for 5 different audiences simultaneously" },
      { icon: "📅", title: "Calendar", desc: "Plan your video schedule ahead of time" },
      { icon: "📊", title: "Analytics", desc: "See how many people watched each video" },
      { icon: "🤖", title: "AI Scriptwriter", desc: "Formal, warm, urgent or conversational tone. Short, medium or long." },
      { icon: "🔗", title: "Tracking links", desc: "Each video gets a unique link with a view counter" },
      { icon: "📱", title: "Mobile-ready", desc: "Works on phone — create and share from anywhere" },
    ],
    note: "No credit card · Starts free",
  },
};

export default function Home() {
  const { lang, setLang } = useLanguage();
  const c = CONTENT[lang] ?? CONTENT.pt;

  return (
    <>
      <style>{CSS}</style>
      <main dir="ltr" className="land" style={{ background: "#080809", minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>

        {/* bg glow */}
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 500, background: "radial-gradient(ellipse,rgba(212,175,55,.055) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* lang switcher */}
        <div className="a1" style={{ position: "fixed", top: 24, right: 28, display: "flex", gap: 6, zIndex: 10 }}>
          {LANGS.map(l => (
            <button key={l.code} className="lang-btn" onClick={() => setLang(l.code)}
              style={{ background: "none", border: `1px solid ${lang === l.code ? "rgba(212,175,55,.5)" : "rgba(255,255,255,.08)"}`, color: lang === l.code ? "#d4af37" : "#444", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".04em" }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* ─── HERO ─── */}
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 680, position: "relative" }}>
            <div className="a1" style={{ marginBottom: 36 }}>
              <span className="sg" style={{ fontSize: "clamp(2.4rem,6vw,3.6rem)", fontWeight: 900, letterSpacing: "-.05em", display: "block", lineHeight: 1 }}>
                Campanha
              </span>
              <span style={{ fontSize: 12, color: "#2a2a2a", fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", display: "block", marginTop: 10 }}>
                🇧🇷 &nbsp; AI · Vídeo · Política
              </span>
            </div>

            <h1 className="a2" style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-.05em", marginBottom: 24, color: "#fff" }}>
              {c.top}<br /><span className="sg">{c.gold}</span>
            </h1>

            <p className="a3" style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", color: "#555", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.8, fontWeight: 400 }}>
              {c.sub}
            </p>

            <div className="a4" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Link href="/dashboard" className="cta-btn"
                style={{ display: "inline-block", background: "#d4af37", color: "#000", borderRadius: 14, padding: "18px 52px", fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", letterSpacing: "-.02em", boxShadow: "0 4px 20px rgba(212,175,55,.2)" }}>
                {c.cta}
              </Link>
              <p style={{ fontSize: 12, color: "#2a2a2a", fontWeight: 600 }}>{c.note}</p>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
          <h2 className="a5" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, textAlign: "center", marginBottom: 56, letterSpacing: "-.04em" }}>
            {c.howTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {c.steps.map((step, i) => (
              <div key={i} className="feat-card a5" style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{step.icon}</div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#d4af37", color: "#000", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{i + 1}</div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{step.title}</p>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section style={{ padding: "40px 24px 100px", maxWidth: 900, margin: "0 auto" }}>
          <h2 className="a6" style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-.04em", color: "#888" }}>
            {c.featTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {c.feats.map((f, i) => (
              <div key={i} className="feat-card" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 16, padding: "22px 22px" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 12 }}>{f.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#ccc" }}>{f.title}</p>
                <p style={{ fontSize: 12, color: "#3a3a3a", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: "center", marginTop: 72 }}>
            <Link href="/dashboard" className="cta-btn"
              style={{ display: "inline-block", background: "#d4af37", color: "#000", borderRadius: 14, padding: "16px 44px", fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: "inherit" }}>
              {c.cta}
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
