"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "972545803037";
const WA_MSG = encodeURIComponent("Olá, vi o Campanha e quero saber mais");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const SPOTS_LEFT = 4;

const CSS = `
  @keyframes shimmer {
    0%{background-position:-200% center}100%{background-position:200% center}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}
  }
  @keyframes float {
    0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}
  }
  @keyframes glow {
    0%,100%{box-shadow:0 0 20px rgba(212,175,55,.3),0 0 60px rgba(212,175,55,.08)}
    50%{box-shadow:0 0 40px rgba(212,175,55,.6),0 0 80px rgba(212,175,55,.18)}
  }
  @keyframes borderFlow {
    0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}
  }
  .sg{
    background:linear-gradient(90deg,#b8860b,#ffd700,#d4af37,#ffd700,#b8860b);
    background-size:200% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;animation:shimmer 3s linear infinite;
  }
  .reveal{opacity:0;transform:translateY(36px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
  .reveal.vis{opacity:1;transform:translateY(0)}
  .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}
  .ch{transition:transform .3s ease,box-shadow .3s ease}
  .ch:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.4)!important}
  .pglow{animation:glow 3s ease-in-out infinite}
  .ha{animation:fadeUp 1s cubic-bezier(.22,1,.36,1) both}
  .ha2{animation-delay:.15s}.ha3{animation-delay:.3s}.ha4{animation-delay:.45s}
  .fl{animation:float 4s ease-in-out infinite}
  @media(max-width:640px){.roi-grid{grid-template-columns:1fr!important}.hide-sm{display:none!important}}
`;

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1400, 1);
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(212,175,55,.15)" }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", textAlign: "left", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e8e8", lineHeight: 1.4 }}>{q}</span>
        <span style={{ background: "#d4af37", color: "#000", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0, transition: "transform .3s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s ease" }}>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, paddingBottom: 20 }}>{a}</p>
      </div>
    </div>
  );
}

function WAButton({ size = "md", label = "📲 Quero ver uma demo →" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const [h, setH] = useState(false);
  const p = size === "lg" ? "20px 44px" : size === "sm" ? "10px 20px" : "14px 28px";
  const f = size === "lg" ? 18 : size === "sm" ? 13 : 15;
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-block", background: h ? "#1ebe5c" : "#25D366", color: "#fff", borderRadius: 14, padding: p, fontSize: f, fontWeight: 800, textDecoration: "none", transition: "all .2s", transform: h ? "translateY(-2px)" : "none", boxShadow: h ? "0 10px 32px rgba(37,211,102,.45)" : "0 4px 16px rgba(37,211,102,.25)" }}>
      {label}
    </a>
  );
}

export default function PitchPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); });
    }, { threshold: 0.07 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <main style={{ background: "#08080a", color: "#e8e8e8", minHeight: "100vh", overflowX: "hidden" }}>

        {/* URGENCY BANNER */}
        <div style={{ background: "linear-gradient(90deg,#9a6e00,#d4af37,#9a6e00)", backgroundSize: "200% auto", animation: "borderFlow 4s linear infinite", color: "#000", textAlign: "center", padding: "12px 16px", fontSize: 13, fontWeight: 800, letterSpacing: .5 }}>
          ⚡ Apenas {SPOTS_LEFT} vagas restantes para a temporada eleitoral 2026 — garanta a sua agora
        </div>

        {/* NAV */}
        <nav style={{ borderBottom: "1px solid rgba(212,175,55,.12)", background: "rgba(8,8,10,.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="sg" style={{ fontWeight: 900, fontSize: 24, letterSpacing: -1 }}>Campanha</span>
            <WAButton size="sm" label="📲 Fale conosco" />
          </div>
        </nav>

        {/* HERO */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "108px 24px 88px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse,rgba(212,175,55,.07) 0%,transparent 70%)", pointerEvents: "none" }} />

          <h1 className="ha ha2" style={{ fontSize: "clamp(2.4rem,6.5vw,4.2rem)", fontWeight: 900, lineHeight: 1.05, marginBottom: 28, letterSpacing: -1.5 }}>
            Seu concorrente publica<br />
            <span className="sg">20 vídeos por mês.</span><br />
            <span style={{ color: "#555" }}>Você publica 3.</span>
          </h1>

          <p className="ha ha3" style={{ fontSize: "clamp(1rem,2.2vw,1.22rem)", color: "#666", maxWidth: 600, margin: "0 auto 52px", lineHeight: 1.9 }}>
            O Campanha cria um <strong style={{ color: "#e8e8e8" }}>avatar de IA</strong> que fala com o seu rosto e a sua voz.<br />
            Escreva o texto → vídeo pronto em <strong style={{ color: "#d4af37" }}>60 segundos.</strong><br />
            Sem câmera. Sem editor. Sem horas.
          </p>

          <div className="ha ha4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
            <WAButton size="lg" label="🚀 Quero uma demo grátis →" />
            <Link href="/" style={{ background: "rgba(255,255,255,.04)", color: "#e8e8e8", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "20px 28px", fontSize: 16, fontWeight: 600, textDecoration: "none", backdropFilter: "blur(8px)" }}>
              Entrar no aplicativo
            </Link>
          </div>

          <div className="ha ha4" style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {["✓ Demo grátis", "✓ Sem cartão de crédito", "✓ Resultado em 30 minutos"].map(t => (
              <span key={t} style={{ fontSize: 13, color: "#444", fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </section>

        {/* PAIN */}
        <section className="reveal" style={{ background: "rgba(229,85,85,.04)", borderTop: "1px solid rgba(229,85,85,.12)", borderBottom: "1px solid rgba(229,85,85,.12)", padding: "80px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#e55", letterSpacing: 2, marginBottom: 14, textAlign: "center", textTransform: "uppercase" }}>O problema real</p>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, marginBottom: 16, textAlign: "center", color: "#fff" }}>Por que bons candidatos perdem?</h2>
            <p style={{ textAlign: "center", color: "#555", marginBottom: 52, fontSize: 15, maxWidth: 520, margin: "0 auto 52px" }}>Não é por falta de boas propostas. É por falta de <strong style={{ color: "#e8e8e8" }}>presença digital constante.</strong></p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              {[
                { icon: "⏰", n: "3–5h", t: "por vídeo", b: "É quanto tempo você perde organizando, gravando, editando e publicando cada vídeo. Multiplique por 20 vídeos — isso é uma semana inteira de campanha desperdiçada." },
                { icon: "💸", n: "R$2.000", t: "por vídeo", b: "O que você paga para uma produtora por um único vídeo profissional. R$40.000 por mês para competir em volume. Nenhum candidato tem esse orçamento." },
                { icon: "📉", n: "70%", t: "das campanhas perdem", b: "Por baixa presença digital. Eleitores não votam em quem não veem. Enquanto você grava um vídeo, seu concorrente publicou cinco." },
              ].map(c => (
                <div key={c.t} className="ch" style={{ background: "rgba(229,85,85,.06)", border: "1px solid rgba(229,85,85,.18)", borderRadius: 20, padding: "32px 28px" }}>
                  <p style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</p>
                  <p style={{ fontSize: "2.2rem", fontWeight: 900, color: "#e55", lineHeight: 1, marginBottom: 4 }}>{c.n}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#e8e8e8", marginBottom: 14 }}>{c.t}</p>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="reveal" style={{ borderTop: "1px solid rgba(212,175,55,.1)", borderBottom: "1px solid rgba(212,175,55,.1)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32, textAlign: "center" }}>
            {[
              { to: 60, s: "s", l: "do texto ao vídeo" },
              { to: 5, s: "", l: "vídeos em 1 clique" },
              { to: 30, s: "h", l: "economizadas/mês" },
              { to: 100, s: "%", l: "seu rosto e voz" },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontSize: "3.2rem", fontWeight: 900, color: "#d4af37", lineHeight: 1, marginBottom: 8 }}><Counter to={s.to} suffix={s.s} /></p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* APP MOCKUP */}
        <section className="reveal" style={{ maxWidth: 960, margin: "0 auto", padding: "88px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>Veja na prática</p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 14, color: "#fff" }}>De texto a vídeo em 60 segundos</h2>
          <p style={{ color: "#555", marginBottom: 52, fontSize: 15 }}>É exatamente o que acontece quando você usa o Campanha</p>

          <div className="fl" style={{ maxWidth: 720, margin: "0 auto", background: "rgba(255,255,255,.02)", border: "1px solid rgba(212,175,55,.18)", borderRadius: 22, overflow: "hidden", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(212,175,55,.08)" }}>
            {/* browser chrome */}
            <div style={{ background: "rgba(255,255,255,.04)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              {["#e55","#ffa500","#4ade80"].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" }} />)}
              <div style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#444", marginLeft: 8 }}>campanha.app/criar</div>
            </div>
            {/* app UI */}
            <div style={{ padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 10, color: "#d4af37", fontWeight: 800, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Seu discurso</p>
                <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 14, fontSize: 12, color: "#666", lineHeight: 1.7, minHeight: 110 }}>
                  "Amigos eleitores, o transporte público de São Paulo precisa de uma revolução. Quando eleito, minha primeira medida será..."
                </div>
                <div style={{ marginTop: 12, background: "#d4af37", borderRadius: 10, padding: 12, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#000" }}>
                  ⚡ Criar Vídeo
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 10, color: "#4ade80", fontWeight: 800, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>✓ Vídeo pronto</p>
                <div style={{ background: "rgba(212,175,55,.07)", border: "1px solid rgba(212,175,55,.2)", borderRadius: 12, aspectRatio: "16/10", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(212,175,55,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#000" }}>▶</div>
                  <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, background: "rgba(0,0,0,.75)", borderRadius: 6, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#fff" }}>Candidato · 1:02</span>
                    <span style={{ fontSize: 11, color: "#d4af37" }}>HD ✓</span>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <div style={{ flex: 1, background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.25)", borderRadius: 8, padding: 8, textAlign: "center", fontSize: 11, color: "#4ade80", fontWeight: 700 }}>WhatsApp</div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: 8, textAlign: "center", fontSize: 11, color: "#555" }}>Baixar</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="reveal" style={{ background: "rgba(255,255,255,.01)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", textAlign: "center" }}>Como funciona</p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 14, textAlign: "center", color: "#fff" }}>Três etapas. Uma única vez.</h2>
            <p style={{ textAlign: "center", color: "#555", marginBottom: 56, fontSize: 15 }}>
              As duas primeiras — <strong style={{ color: "#e8e8e8" }}>só acontecem uma vez na vida.</strong><br />
              Depois: escreva → vídeo pronto.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 2 }}>
              {[
                { n: "01", icon: "🎥", title: "Grave uma vez", time: "10 min · única vez", body: "Câmera doméstica, boa iluminação, fundo limpo. Leia um texto curto de consentimento e fale livremente por 2–5 minutos.", tag: "ÚNICA VEZ", tc: "#888" },
                { n: "02", icon: "🤖", title: "A IA cria seu avatar", time: "5–10 min · automático", body: "Você não faz nada. O D-ID V3 analisa seu rosto, voz, movimentos labiais e aprende seu jeito de falar.", tag: "AUTOMÁTICO", tc: "#d4af37" },
                { n: "03", icon: "⚡", title: "Texto → Vídeo", time: "60 segundos · ilimitado", body: "Escreva o discurso (ou deixe a IA escrever). Clique em Criar. Em 60 segundos — vídeo pronto para WhatsApp.", tag: "ILIMITADO", tc: "#4ade80" },
              ].map((s, i) => (
                <div key={s.n} className={`ch reveal d${i + 1}`} style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, padding: "36px 28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 16, right: 20, fontSize: "4.5rem", fontWeight: 900, color: "rgba(212,175,55,.06)", lineHeight: 1, userSelect: "none" }}>{s.n}</div>
                  <p style={{ fontSize: 36, marginBottom: 20 }}>{s.icon}</p>
                  <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, color: "#fff" }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: "#d4af37", fontWeight: 700, marginBottom: 16 }}>{s.time}</p>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>{s.body}</p>
                  <span style={{ display: "inline-block", background: `${s.tc}18`, border: `1px solid ${s.tc}40`, color: s.tc, borderRadius: 999, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="reveal" style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", textAlign: "center" }}>O que você recebe</p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 52, textAlign: "center", color: "#fff" }}>Ferramentas que transformam a campanha</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {[
              { icon: "⚡", title: "Campanha Burst", hot: true, body: "Escreva um tema → a IA gera 5 discursos para jovens, idosos, pais, empresários e geral. Os 5 vídeos criados simultaneamente." },
              { icon: "✦", title: "IA escreve o discurso", body: "\"Transporte público, zona sul, público idoso\" — a IA escreve um discurso completo e persuasivo em segundos." },
              { icon: "📲", title: "Compartilhamento direto", body: "Botão de WhatsApp em cada vídeo. Direto do app para o celular dos eleitores — sem download, sem upload manual." },
              { icon: "📝", title: "Legendas automáticas", body: "Cada vídeo vem com legendas sincronizadas. Essencial — 70% das visualizações nas redes são sem som." },
              { icon: "🌍", title: "Português, Inglês, Espanhol", body: "Interface completa em 3 idiomas. Perfeito para campanhas com público multicultural." },
              { icon: "🔒", title: "Protegido juridicamente", body: "Cada avatar criado com termo de consentimento explícito. Seu rosto e voz são exclusivamente seus." },
            ].map(f => (
              <div key={f.title} className="ch" style={{ background: f.hot ? "rgba(212,175,55,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${f.hot ? "rgba(212,175,55,.35)" : "rgba(255,255,255,.06)"}`, borderRadius: 18, padding: "28px 24px", position: "relative" }}>
                {f.hot && <span style={{ position: "absolute", top: -12, left: 20, background: "#d4af37", color: "#000", fontSize: 10, fontWeight: 900, padding: "3px 12px", borderRadius: 999, letterSpacing: 1 }}>MAIS POPULAR</span>}
                <p style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</p>
                <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: "#fff" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ROI */}
        <section className="reveal" style={{ background: "rgba(255,255,255,.01)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textAlign: "center", textTransform: "uppercase" }}>Retorno sobre investimento</p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 48, textAlign: "center", color: "#fff" }}>Quanto custa produzir conteúdo hoje?</h2>
            <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 16, alignItems: "center", marginBottom: 28 }}>
              <div style={{ background: "rgba(229,85,85,.06)", border: "1px solid rgba(229,85,85,.18)", borderRadius: 20, padding: "28px 24px" }}>
                <p style={{ fontWeight: 800, color: "#e55", marginBottom: 20, fontSize: 16 }}>❌ Sem Campanha</p>
                {[["Preparo por vídeo", "3–5 horas"], ["Custo por vídeo", "R$800–3.000"], ["Vídeos por mês", "2–3 apenas"], ["Custo mensal", "R$3.000–9.000"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: "#444" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#e55" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 20, textAlign: "center", color: "#d4af37", fontWeight: 900 }}>VS</div>
              <div style={{ background: "rgba(212,175,55,.06)", border: "1px solid rgba(212,175,55,.28)", borderRadius: 20, padding: "28px 24px" }}>
                <p style={{ fontWeight: 800, color: "#d4af37", marginBottom: 20, fontSize: 16 }}>✓ Com Campanha</p>
                {[["Preparo por vídeo", "< 5 minutos"], ["Custo por vídeo", "≈ R$0"], ["Vídeos por mês", "ilimitados"], ["Custo mensal", "R$3.500 única vez"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: "#444" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#d4af37" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(212,175,55,.05)", border: "1px solid rgba(212,175,55,.18)", borderRadius: 16, padding: "24px 28px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>O pacote se paga após apenas</p>
              <p style={{ fontSize: "2.4rem", fontWeight: 900, color: "#d4af37", lineHeight: 1, marginBottom: 6 }}>2 vídeos</p>
              <p style={{ fontSize: 13, color: "#444" }}>comparado ao custo de produção tradicional</p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="reveal" style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", textAlign: "center" }}>O que dizem</p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 48, textAlign: "center", color: "#fff" }}>Políticos que já transformaram sua comunicação</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {[
              { name: "Carlos M.", role: "Vereador, São Paulo", quote: "Em três semanas publiquei mais vídeos do que em todo o ano anterior. Meu engajamento no Instagram triplicou. Isso mudou minha campanha completamente." },
              { name: "Ana P.", role: "Candidata a deputada, Rio de Janeiro", quote: "Sempre tive dificuldade com câmera. Agora crio vídeos sem precisar gravar nada. Minha equipe mal acredita que é IA — parece exatamente eu." },
              { name: "Roberto S.", role: "Prefeito, Belo Horizonte", quote: "O Campanha Burst é genial. Crio 5 vídeos diferentes sobre o mesmo tema em minutos. Cada bairro recebe uma mensagem personalizada." },
            ].map(t => (
              <div key={t.name} className="ch" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "28px 24px" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#d4af37", fontSize: 15 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: "#888", lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(212,175,55,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#d4af37", flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "#444" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="reveal" style={{ background: "rgba(255,255,255,.01)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>Preço</p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 10, color: "#fff" }}>Um preço. Claro.</h2>
            <p style={{ color: "#555", marginBottom: 40, fontSize: 15 }}>Sem mensalidades. Sem surpresas. Pacote para toda a campanha.</p>
            <div className="pglow" style={{ background: "rgba(212,175,55,.04)", border: "2px solid rgba(212,175,55,.45)", borderRadius: 24, padding: "48px 40px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(212,175,55,.07) 0%,transparent 60%)", pointerEvents: "none" }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", marginBottom: 14, letterSpacing: 1.5 }}>PACOTE CAMPANHA 2026</p>
              <p style={{ fontSize: "4.5rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 6 }}>R$3.500</p>
              <p style={{ color: "#444", fontSize: 14, marginBottom: 40 }}>Pagamento único · por toda a duração da campanha</p>
              <div style={{ textAlign: "left", marginBottom: 40 }}>
                {["Avatar pessoal — seu rosto e sua voz", "Vídeos ilimitados durante a campanha", "Campanha Burst — 5 públicos em 1 clique", "IA que escreve seus discursos", "Legendas automáticas em todos os vídeos", "Compartilhamento WhatsApp / Telegram", "Suporte pessoal dedicado"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                    <span style={{ color: "#d4af37", flexShrink: 0, fontSize: 16, fontWeight: 900 }}>✓</span>
                    <p style={{ fontSize: 14, color: "#777" }}>{item}</p>
                  </div>
                ))}
              </div>
              <WAButton size="lg" label="📲 Quero começar agora →" />
              <div style={{ marginTop: 24, padding: "14px 18px", background: "rgba(229,85,85,.08)", borderRadius: 12, border: "1px solid rgba(229,85,85,.2)" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#e55" }}>⏳ Restam {SPOTS_LEFT} vagas para a temporada 2026</p>
                <p style={{ fontSize: 12, color: "#444", marginTop: 4 }}>Limitamos os clientes para manter um atendimento personalizado</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#333" }}>✓ Demo grátis · ✓ Sem compromisso · ✓ Resultado em 1 dia</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="reveal" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", textAlign: "center" }}>Perguntas frequentes</p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, marginBottom: 48, textAlign: "center", color: "#fff" }}>Respostas para todas as dúvidas</h2>
          {[
            { q: "Os vídeos parecem reais?", a: "Sim — nas condições certas. O D-ID V3 Instant Avatar gera movimentos labiais, expressões faciais e movimentos de cabeça naturais. Boa iluminação, fundo limpo e vídeo em 1080p — o resultado parece completamente profissional. Por isso começamos com uma demo gratuita para você ver com seus próprios olhos antes de pagar qualquer coisa." },
            { q: "Quanto tempo leva a configuração inicial?", a: "10 minutos de gravação + 5–10 minutos de processamento automático. Depois, cada vídeo novo fica pronto em 60 segundos. A configuração é feita uma única vez." },
            { q: "Quantos vídeos posso criar?", a: "Ilimitados durante toda a campanha. Sem cobrança por vídeo, sem créditos que acabam, sem surpresas." },
            { q: "O que é o Campanha Burst?", a: "Você escreve um tema — por exemplo «transporte público» — e a IA gera 5 versões diferentes do mesmo discurso: uma para jovens, uma para idosos, uma para pais, uma para empresários e uma geral. Os 5 vídeos são criados simultaneamente." },
            { q: "Meu rosto e voz estão protegidos?", a: "Sim. O D-ID exige um termo de consentimento explícito antes de qualquer treinamento de avatar. Seu rosto e voz não serão usados para nenhuma finalidade sem sua autorização. O avatar pertence somente a você." },
            { q: "O que acontece depois das eleições?", a: "O pacote cobre o período da campanha. Você pode continuar com um novo pacote para a próxima campanha ou encerrar. Sem compromisso contínuo." },
          ].map(faq => <FAQ key={faq.q} {...faq} />)}
        </section>

        {/* FINAL CTA */}
        <section className="reveal" style={{ background: "rgba(212,175,55,.04)", borderTop: "1px solid rgba(212,175,55,.12)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#d4af37", letterSpacing: 2, marginBottom: 18, textTransform: "uppercase" }}>Pronto para ganhar?</p>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, marginBottom: 20, color: "#fff", lineHeight: 1.08, letterSpacing: -1.5 }}>
              As eleições não esperam.<br />
              <span className="sg">Comece hoje.</span>
            </h2>
            <p style={{ color: "#555", fontSize: 16, marginBottom: 48, lineHeight: 1.9, maxWidth: 480, margin: "0 auto 48px" }}>
              Dê-nos 30 minutos — mostraremos uma demo com o seu rosto.<br />
              <strong style={{ color: "#e8e8e8" }}>Grátis. Sem compromisso.</strong><br />
              Se não ficar impressionado — não paga nada.
            </p>
            <WAButton size="lg" label="📲 Enviar mensagem no WhatsApp →" />
            <p style={{ marginTop: 20, fontSize: 13, color: "#333" }}>Respondemos em até 1 hora · {SPOTS_LEFT} vagas restantes</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "28px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#2a2a2a" }}>Campanha · desenvolvido com D-ID AI · todos os direitos reservados</p>
        </footer>

        {/* FLOATING WA */}
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 100, background: "#25D366", color: "#fff", borderRadius: 999, padding: "16px 26px", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 32px rgba(37,211,102,.5)", display: "flex", alignItems: "center", gap: 10, opacity: scrolled ? 1 : 0, transform: scrolled ? "translateY(0) scale(1)" : "translateY(20px) scale(.9)", transition: "all .4s cubic-bezier(.22,1,.36,1)", pointerEvents: scrolled ? "auto" : "none" }}>
          📲 Demo grátis
        </a>

      </main>
    </>
  );
}
