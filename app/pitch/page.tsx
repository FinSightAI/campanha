"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "972545803037";
const WA_MSG = encodeURIComponent("Olá, vi o Campanha e quero saber mais");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const SPOTS_LEFT = 4;

// ── Animated counter ──────────────────────────────────────────────────────
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
        const p = Math.min((ts - start) / 1200, 1);
        setVal(Math.floor(p * to));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

// ── FAQ item ─────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "100%", textAlign: "left", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{q}</span>
        <span style={{ color: "var(--gold)", fontSize: 20, flexShrink: 0, marginLeft: 12 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, paddingBottom: 18 }}>{a}</p>}
    </div>
  );
}

// ── WA button ─────────────────────────────────────────────────────────────
function WAButton({ size = "md", label = "📲 Quero ver uma demo →" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const pad = size === "lg" ? "18px 40px" : size === "sm" ? "10px 20px" : "14px 28px";
  const fs = size === "lg" ? 18 : size === "sm" ? 13 : 15;
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-block", background: "#25D366", color: "#fff", borderRadius: 12, padding: pad, fontSize: fs, fontWeight: 800, textDecoration: "none" }}>
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

  return (
    <main dir="ltr" style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* ── URGENCY BANNER ── */}
      <div style={{ background: "var(--gold)", color: "#000", textAlign: "center", padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
        ⚡ Restam apenas {SPOTS_LEFT} vagas para a temporada eleitoral 2026 — não perca
      </div>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 900, fontSize: 22, color: "var(--gold)", letterSpacing: -0.5 }}>Campanha</span>
          <WAButton size="sm" label="📲 Fale conosco" />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 72px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 16px", fontSize: 12, color: "var(--muted)", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          Desenvolvido com D-ID AI · V3 Instant Avatar Technology
        </div>

        <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: "var(--text)" }}>
          Seu concorrente já publica<br />
          <span style={{ color: "var(--gold)" }}>20 vídeos por mês.</span><br />
          Você publica 3.
        </h1>

        <p style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: "var(--muted)", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.8 }}>
          O Campanha te dá um <strong style={{ color: "var(--text)" }}>avatar de IA</strong> que parece e soa exatamente como você.
          Escreva o texto — receba um vídeo pronto em 60 segundos. Sem câmera. Sem editor. Sem horas.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <WAButton size="lg" label="🚀 Quero uma demo grátis →" />
          <Link href="/"
            style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 24px", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
            Entrar no aplicativo
          </Link>
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {["✓ Demo grátis", "✓ Sem cartão de crédito", "✓ Resultados em 30 minutos"].map(t => (
            <span key={t} style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { to: 60, suffix: " segundos", label: "do texto ao vídeo pronto" },
            { to: 5, suffix: " vídeos", label: "em um clique — Campaign Burst" },
            { to: 30, suffix: " horas", label: "economizadas por mês em média" },
            { to: 100, suffix: "%", label: "seu rosto e sua voz — não de outro" },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontSize: "2.6rem", fontWeight: 900, color: "var(--gold)", lineHeight: 1, marginBottom: 6 }}>
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROI SECTION ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textAlign: "center", textTransform: "uppercase" }}>Retorno sobre investimento</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 40, textAlign: "center", color: "var(--text)" }}>
          Quanto custa produzir conteúdo hoje?
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 40 }}>
          {/* Without */}
          <div style={{ background: "var(--card)", border: "1px solid #e55", borderRadius: 16, padding: 28 }}>
            <p style={{ fontWeight: 800, color: "#e55", marginBottom: 20, fontSize: 16 }}>❌ Sem Campanha</p>
            {[
              ["Horas de preparo por vídeo", "3–5 horas"],
              ["Custo por vídeo", "R$800–3.000"],
              ["Vídeos por mês", "2–3 apenas"],
              ["Custo mensal", "R$3.000–9.000"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e55" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 28, textAlign: "center", color: "var(--gold)", fontWeight: 900 }}>VS</div>

          {/* With */}
          <div style={{ background: "var(--card)", border: "1px solid var(--gold)", borderRadius: 16, padding: 28 }}>
            <p style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 20, fontSize: 16 }}>✓ Com Campanha</p>
            {[
              ["Horas de preparo por vídeo", "< 5 minutos"],
              ["Custo por vídeo", "quase R$0"],
              ["Vídeos por mês", "ilimitados"],
              ["Custo mensal", "R$3.500 uma vez"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>O pacote se paga depois de apenas</p>
          <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--gold)" }}>2 vídeos</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>comparado ao custo de produção tradicional</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>Como funciona</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 8, textAlign: "center", color: "var(--text)" }}>
            Três etapas. Uma única vez.
          </h2>
          <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 52, fontSize: 15 }}>
            As primeiras etapas — <strong style={{ color: "var(--text)" }}>só uma vez na vida.</strong> Depois: escreva um discurso → receba o vídeo.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { n: "1", icon: "🎥", title: "Grave você mesmo", time: "10 minutos · uma única vez", body: "Câmera doméstica, boa iluminação, fundo limpo. Leia um texto curto para autorização e fale naturalmente por 2–5 minutos. Só isso.", tag: "única vez" },
              { n: "2", icon: "🤖", title: "A IA cria seu avatar", time: "5–10 minutos · totalmente automático", body: "Você não faz nada. O D-ID V3 aprende seu rosto, voz, movimentos labiais e seu jeito único de falar.", tag: "automático" },
              { n: "3", icon: "⚡", title: "Escreva → receba o vídeo", time: "60 segundos por vídeo", body: "Escreva o discurso (ou deixe a IA escrever por você). Clique em «Criar vídeo». Em um minuto — vídeo pronto para compartilhar no WhatsApp.", tag: "∞ ilimitado" },
            ].map(s => (
              <div key={s.n} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 18, padding: "28px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, flexShrink: 0 }}>{s.n}</span>
                  <span style={{ fontSize: 26 }}>{s.icon}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, color: "var(--text)" }}>{s.title}</p>
                <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 14 }}>{s.time}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>{s.body}</p>
                <span style={{ display: "inline-block", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>O que você recebe</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: "var(--text)" }}>
          Ferramentas que transformam a campanha
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { icon: "⚡", title: "Campaign Burst", hot: true, body: "Escreva um tema — a IA gera 5 discursos para públicos diferentes: jovens, idosos, pais, empresários e geral. Os 5 vídeos são criados simultaneamente." },
            { icon: "✦", title: "IA escreve o discurso", body: "Escreva \"transporte público, zona sul, público idoso\" — a IA escreve um discurso completo e persuasivo em português, inglês ou espanhol." },
            { icon: "📲", title: "Compartilhamento direto no WhatsApp", body: "Botão de compartilhamento em cada vídeo. Direto do aplicativo para o celular dos eleitores — sem download, sem upload." },
            { icon: "📝", title: "Legendas automáticas", body: "Cada vídeo vem com legendas sincronizadas. Essencial — 70% das visualizações nas redes são sem som." },
            { icon: "🌍", title: "Português, Inglês e Espanhol", body: "Interface completa em 3 idiomas. Perfeito para campanhas com público multicultural." },
            { icon: "🔒", title: "Legalmente protegido", body: "Cada avatar é criado com termo de consentimento explícito. Seu rosto e voz não serão usados sem sua autorização expressa." },
          ].map(f => (
            <div key={f.title} style={{ background: "var(--card)", border: `1px solid ${f.hot ? "var(--gold)" : "var(--border)"}`, borderRadius: 14, padding: "24px 20px", position: "relative" }}>
              {f.hot && <span style={{ position: "absolute", top: -10, left: 16, background: "var(--gold)", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 999 }}>Mais popular</span>}
              <p style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</p>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--text)" }}>{f.title}</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Preço</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>Um preço. Claro.</h2>
          <p style={{ color: "var(--muted)", marginBottom: 40, fontSize: 15 }}>Sem mensalidades. Sem surpresas. Pacote para toda a campanha.</p>

          <div style={{ background: "var(--bg)", border: "2px solid var(--gold)", borderRadius: 22, padding: "44px 36px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>Pacote Campanha 2026</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: "4rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>R$3.500</p>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 36 }}>Pagamento único · por toda a duração da campanha</p>

            <div style={{ textAlign: "left", marginBottom: 36 }}>
              {[
                "Configuração do seu avatar pessoal (rosto + voz)",
                "Vídeos ilimitados durante toda a campanha",
                "Campaign Burst — 5 públicos em um clique",
                "IA que escreve discursos por você",
                "Legendas automáticas para cada vídeo",
                "Compartilhamento direto WhatsApp / Telegram",
                "Suporte pessoal durante todo o processo",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 16 }}>✓</span>
                  <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "left" }}>{item}</p>
                </div>
              ))}
            </div>

            <WAButton size="lg" label="📲 Quero começar agora →" />

            <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e55" }}>
                ⏳ Restam {SPOTS_LEFT} vagas para a temporada 2026
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Limitamos os clientes para manter um atendimento personalizado</p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)" }}>✓ Demo grátis · ✓ Sem compromisso · ✓ Resultados em 1 dia</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>Perguntas frequentes</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 40, textAlign: "center", color: "var(--text)" }}>
          Respostas para todas as dúvidas
        </h2>

        {[
          { q: "Os vídeos parecem reais?", a: "Sim — nas condições certas. O D-ID V3 Instant Avatar gera movimentos labiais, expressões faciais e movimentos de cabeça naturais. Boa iluminação, fundo limpo e vídeo em 1080p — o resultado parece completamente profissional. Por isso começamos com uma demo para você ver com seus próprios olhos antes de pagar qualquer coisa." },
          { q: "Quanto tempo leva a configuração inicial?", a: "10 minutos de gravação + 5–10 minutos de processamento automático. Depois disso, cada vídeo é criado em 60 segundos. A configuração é feita uma única vez." },
          { q: "Quantos vídeos posso criar?", a: "Ilimitados durante toda a campanha. Sem cobrança por vídeo, sem créditos que acabam." },
          { q: "O que é o Campaign Burst?", a: "Você escreve um tema — por exemplo «transporte público» — e a IA gera 5 versões diferentes do mesmo discurso: uma para jovens, uma para idosos, uma para pais, uma para empresários e uma geral. Os 5 vídeos são criados simultaneamente." },
          { q: "Meu rosto e voz estão protegidos?", a: "Sim. O D-ID exige um termo de consentimento explícito antes de qualquer treinamento de avatar. Seu rosto e voz não serão usados para nenhuma finalidade sem sua autorização. O avatar pertence somente a você." },
          { q: "O que acontece depois das eleições?", a: "O pacote cobre o período da campanha. Você pode continuar com um novo pacote para a próxima campanha ou encerrar. Sem compromisso contínuo." },
        ].map(faq => <FAQ key={faq.q} {...faq} />)}
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: 16, color: "var(--text)", lineHeight: 1.2 }}>
            As eleições não esperam.<br />
            <span style={{ color: "var(--gold)" }}>Comece a produzir conteúdo hoje.</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            Dê-nos 30 minutos — mostraremos uma demo com o seu rosto. Grátis, sem compromisso.<br />
            Se não ficar impressionado — não paga nada.
          </p>
          <WAButton size="lg" label="📲 Enviar mensagem no WhatsApp agora →" />
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>Respondemos em até 1 hora · {SPOTS_LEFT} vagas restantes</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          Campanha · desenvolvido com D-ID AI · todos os direitos reservados
        </p>
      </footer>

      {/* ── FLOATING WA BUTTON ── */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          background: "#25D366", color: "#fff", borderRadius: 999,
          padding: "14px 22px", fontSize: 15, fontWeight: 800, textDecoration: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", gap: 8,
          opacity: scrolled ? 1 : 0,
          transform: scrolled ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.3s, transform 0.3s",
          pointerEvents: scrolled ? "auto" : "none",
        }}>
        📲 Demo grátis
      </a>

    </main>
  );
}
