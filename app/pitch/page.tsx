"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "972545803037";
const WA_MSG = encodeURIComponent("Olá, vi o Campanha e quero saber mais");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const SPOTS_LEFT = 4;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .pitch { font-family: 'Sora', system-ui, sans-serif; }
  @keyframes shimmer {
    0%{background-position:-200% center}100%{background-position:200% center}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}
  }
  @keyframes glow {
    0%,100%{box-shadow:0 0 40px rgba(212,175,55,.25)}
    50%{box-shadow:0 0 80px rgba(212,175,55,.55)}
  }
  .sg {
    background: linear-gradient(90deg,#9a6e00,#f0c040,#d4af37,#f0c040,#9a6e00);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 4s linear infinite;
  }
  .ha  { animation: fadeUp .9s cubic-bezier(.22,1,.36,1) both; }
  .ha2 { animation-delay: .12s; }
  .ha3 { animation-delay: .24s; }
  .ha4 { animation-delay: .36s; }
  .reveal { opacity:0; transform:translateY(28px); transition: opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
  .reveal.vis { opacity:1; transform:translateY(0); }
  .d1{transition-delay:.08s} .d2{transition-delay:.16s} .d3{transition-delay:.24s}
  .card { transition: transform .25s ease, box-shadow .25s ease; }
  .card:hover { transform: translateY(-4px); }
  .pglow { animation: glow 3s ease-in-out infinite; }
  @media(max-width:680px){
    .steps { grid-template-columns: 1fr !important; }
    .roi-grid { grid-template-columns: 1fr !important; }
    .vs-divider { display: none !important; }
  }
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
    <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", textAlign: "left", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", gap: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#e0e0e0", lineHeight: 1.4, fontFamily: "inherit" }}>{q}</span>
        <span style={{ background: open ? "#d4af37" : "rgba(212,175,55,.15)", color: open ? "#000" : "#d4af37", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0, transition: "all .3s", transform: open ? "rotate(45deg)" : "none", border: "1px solid rgba(212,175,55,.3)" }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s ease" }}>
        <p style={{ fontSize: 15, color: "#777", lineHeight: 1.9, paddingBottom: 22, fontWeight: 400 }}>{a}</p>
      </div>
    </div>
  );
}

function WAButton({ size = "md", label = "📲 Quero ver uma demo →" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const [h, setH] = useState(false);
  const p = size === "lg" ? "18px 40px" : size === "sm" ? "9px 18px" : "13px 26px";
  const f = size === "lg" ? 17 : size === "sm" ? 13 : 15;
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-block", background: h ? "#1da851" : "#25D366", color: "#fff", borderRadius: 12, padding: p, fontSize: f, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", transition: "all .2s", transform: h ? "translateY(-2px)" : "none", boxShadow: h ? "0 12px 36px rgba(37,211,102,.4)" : "0 4px 18px rgba(37,211,102,.22)", letterSpacing: "-.01em" }}>
      {label}
    </a>
  );
}

export default function PitchPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 500);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); });
    }, { threshold: 0.06 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <main className="pitch" style={{ background: "#080809", color: "#e0e0e0", minHeight: "100vh", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,9,.9)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="sg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.04em" }}>Campanha</span>
              <span style={{ fontSize: 18 }}>🇧🇷</span>
            </span>
            <WAButton size="sm" label="📲 Fale conosco" />
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "120px 32px 100px", textAlign: "center" }}>
          <h1 className="ha" style={{ fontSize: "clamp(2.8rem,7vw,5rem)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-.05em", marginBottom: 32, color: "#fff" }}>
            Seu concorrente<br />
            publica <span className="sg">20 vídeos</span><br />
            por mês
          </h1>
          <p className="ha ha2" style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "#666", maxWidth: 540, margin: "0 auto 52px", lineHeight: 1.8, fontWeight: 400, letterSpacing: "-.01em" }}>
            O Campanha cria um avatar de IA com o seu rosto e a sua voz.
            Escreva o discurso — vídeo pronto em <strong style={{ color: "#d4af37", fontWeight: 700 }}>60 segundos.</strong>
          </p>
          <div className="ha ha3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/dashboard" style={{ background: "#d4af37", color: "#000", borderRadius: 12, padding: "18px 40px", fontSize: 17, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", letterSpacing: "-.02em", transition: "all .2s", display: "inline-block" }}>
              Experimentar agora →
            </Link>
            <WAButton size="lg" label="📲 Falar conosco" />
          </div>
          <p className="ha ha4" style={{ fontSize: 13, color: "#333", fontWeight: 500, letterSpacing: ".02em" }}>
            SEM CARTÃO DE CRÉDITO &nbsp;·&nbsp; RESULTADO EM 30 MIN &nbsp;·&nbsp; {SPOTS_LEFT} VAGAS RESTANTES
          </p>
        </section>

        {/* ── STATS ── */}
        <section className="reveal" style={{ borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, textAlign: "center" }}>
            {[
              { to: 60, s: "s", l: "do texto ao vídeo" },
              { to: 5,  s: "×", l: "vídeos em 1 clique" },
              { to: 30, s: "h", l: "economizadas / mês" },
              { to: 100,s: "%", l: "seu rosto e sua voz" },
            ].map(s => (
              <div key={s.l} style={{ padding: "8px 0" }}>
                <p style={{ fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 900, color: "#d4af37", lineHeight: 1, marginBottom: 10, letterSpacing: "-.04em" }}>
                  <Counter to={s.to} suffix={s.s} />
                </p>
                <p style={{ fontSize: 13, color: "#444", fontWeight: 500, letterSpacing: ".02em", lineHeight: 1.4 }}>{s.l.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="reveal" style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 32px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#d4af37", letterSpacing: ".14em", marginBottom: 20, textAlign: "center", textTransform: "uppercase" }}>Como funciona</p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, marginBottom: 72, textAlign: "center", color: "#fff", letterSpacing: "-.04em", lineHeight: 1.1 }}>
            Três etapas.<br />A terceira é infinita.
          </h2>
          <div className="steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { n: "01", icon: "🎥", title: "Grave uma vez", sub: "10 min · única vez na vida", body: "Câmera doméstica, fundo limpo, boa iluminação. Você lê um texto de consentimento e fala livremente por 2–5 minutos. Só isso.", tag: "Única vez" },
              { n: "02", icon: "🤖", title: "A IA aprende você", sub: "5–10 min · automático", body: "O D-ID V3 aprende seu rosto, voz, movimentos labiais e seu jeito de falar. Você não faz nada.", tag: "Automático" },
              { n: "03", icon: "⚡", title: "Escreva → Vídeo", sub: "60 segundos · ilimitado", body: "Escreva qualquer discurso. A IA gera o vídeo com o seu rosto falando. Compartilhe direto no WhatsApp.", tag: "Ilimitado" },
            ].map((s, i) => (
              <div key={s.n} className={`card reveal d${i+1}`} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "36px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <span style={{ fontSize: 32 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333", letterSpacing: ".04em" }}>{s.n}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, color: "#fff", letterSpacing: "-.03em" }}>{s.title}</p>
                <p style={{ fontSize: 12, color: "#d4af37", fontWeight: 600, marginBottom: 18, letterSpacing: ".02em" }}>{s.sub.toUpperCase()}</p>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 24, fontWeight: 400 }}>{s.body}</p>
                <span style={{ display: "inline-block", border: "1px solid rgba(255,255,255,.08)", color: "#444", borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="reveal" style={{ background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", padding: "100px 32px", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#d4af37", letterSpacing: ".14em", marginBottom: 20, textTransform: "uppercase" }}>Preço</p>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, marginBottom: 12, color: "#fff", letterSpacing: "-.04em" }}>Um preço. Claro.</h2>
            <p style={{ color: "#555", marginBottom: 48, fontSize: 15, fontWeight: 400 }}>Sem mensalidade. Sem surpresas.<br />Um pacote para toda a campanha.</p>

            <div className="pglow" style={{ background: "rgba(212,175,55,.035)", border: "1.5px solid rgba(212,175,55,.4)", borderRadius: 24, padding: "52px 44px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -20%,rgba(212,175,55,.08) 0%,transparent 65%)", pointerEvents: "none" }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#d4af37", letterSpacing: ".12em", marginBottom: 20 }}>PACOTE CAMPANHA 2026</p>
              <p style={{ fontSize: "clamp(3.5rem,8vw,5rem)", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 8, letterSpacing: "-.05em" }}>R$3.500</p>
              <p style={{ color: "#444", fontSize: 14, marginBottom: 44, fontWeight: 400 }}>Pagamento único · por toda a campanha</p>

              <div style={{ textAlign: "left", marginBottom: 44 }}>
                {[
                  "Avatar — seu rosto e sua voz",
                  "Vídeos ilimitados",
                  "Campanha Burst — 5 públicos em 1 clique",
                  "IA que escreve seus discursos",
                  "Legendas automáticas",
                  "Compartilhamento WhatsApp / Telegram",
                  "Suporte pessoal dedicado",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
                    <span style={{ color: "#d4af37", fontSize: 14, flexShrink: 0 }}>✓</span>
                    <p style={{ fontSize: 14, color: "#666", fontWeight: 400, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>

              <WAButton size="lg" label="📲 Quero começar agora →" />

              <div style={{ marginTop: 24, padding: "14px 16px", background: "rgba(229,85,85,.07)", borderRadius: 12, border: "1px solid rgba(229,85,85,.18)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#e55", margin: 0 }}>⏳ Restam {SPOTS_LEFT} vagas para 2026</p>
                <p style={{ fontSize: 12, color: "#444", marginTop: 4, fontWeight: 400 }}>Limitamos clientes para manter atendimento personalizado</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#2e2e2e", fontWeight: 500 }}>✓ Demo grátis &nbsp;·&nbsp; ✓ Sem compromisso &nbsp;·&nbsp; ✓ Resultado em 1 dia</p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="reveal" style={{ maxWidth: 680, margin: "0 auto", padding: "100px 32px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#d4af37", letterSpacing: ".14em", marginBottom: 20, textTransform: "uppercase", textAlign: "center" }}>Dúvidas</p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, marginBottom: 56, textAlign: "center", color: "#fff", letterSpacing: "-.04em" }}>Perguntas frequentes</h2>
          {[
            { q: "Os vídeos parecem reais?", a: "Sim — nas condições certas. Boa iluminação, fundo limpo e vídeo em 1080p — o resultado parece completamente profissional. Por isso começamos com uma demo gratuita para você ver com seus próprios olhos antes de pagar." },
            { q: "Quanto tempo leva a configuração?", a: "10 minutos de gravação + 5–10 minutos de processamento automático. Feito isso, cada vídeo novo fica pronto em 60 segundos. A configuração é feita uma única vez." },
            { q: "Quantos vídeos posso criar?", a: "Ilimitados. Sem cobrança por vídeo, sem créditos que acabam, sem surpresas." },
            { q: "O que é o Campanha Burst?", a: "Você escreve um tema — por exemplo «transporte público» — e a IA gera 5 versões do mesmo discurso: para jovens, idosos, pais, empresários e público geral. Os 5 vídeos são criados ao mesmo tempo." },
            { q: "Meu rosto e voz estão protegidos?", a: "Sim. O D-ID exige um termo de consentimento explícito antes de qualquer treinamento. Seu rosto e voz pertencem somente a você." },
          ].map(faq => <FAQ key={faq.q} {...faq} />)}
        </section>

        {/* ── FINAL CTA ── */}
        <section className="reveal" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "120px 32px", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 900, marginBottom: 24, color: "#fff", lineHeight: 1.04, letterSpacing: "-.05em" }}>
              As eleições<br />
              não esperam.<br />
              <span className="sg">Comece hoje.</span>
            </h2>
            <p style={{ color: "#555", fontSize: 16, marginBottom: 48, lineHeight: 1.8, fontWeight: 400 }}>
              30 minutos de demo com o seu rosto — grátis.<br />
              Se não ficar impressionado, não paga nada.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard" style={{ background: "#d4af37", color: "#000", borderRadius: 12, padding: "18px 40px", fontSize: 17, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", letterSpacing: "-.02em", display: "inline-block" }}>
                Experimentar agora →
              </Link>
              <WAButton size="lg" label="📲 Falar no WhatsApp" />
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: "#2e2e2e", fontWeight: 500 }}>Resposta em até 1 hora &nbsp;·&nbsp; {SPOTS_LEFT} vagas restantes</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.04)", padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#222", fontWeight: 500 }}>Campanha · todos os direitos reservados</p>
        </footer>

        {/* ── FLOATING CTA ── */}
        <Link href="/dashboard" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 100, background: "#d4af37", color: "#000", borderRadius: 999, padding: "15px 26px", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", letterSpacing: "-.02em", boxShadow: "0 8px 32px rgba(212,175,55,.35)", display: "flex", alignItems: "center", gap: 8, opacity: scrolled ? 1 : 0, transform: scrolled ? "translateY(0)" : "translateY(16px)", transition: "all .4s cubic-bezier(.22,1,.36,1)", pointerEvents: scrolled ? "auto" : "none" }}>
          Experimentar →
        </Link>

      </main>
    </>
  );
}
