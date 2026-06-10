"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "972500000000"; // ← עדכן למספר שלך
const WA_MSG = encodeURIComponent("היי, ראיתי את Campanha ואני רוצה לשמוע עוד");
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
  return <span ref={ref}>{val.toLocaleString("he-IL")}{suffix}</span>;
}

// ── FAQ item ─────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "100%", textAlign: "right", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{q}</span>
        <span style={{ color: "var(--gold)", fontSize: 20, flexShrink: 0, marginRight: 12 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, paddingBottom: 18 }}>{a}</p>}
    </div>
  );
}

// ── WA button ─────────────────────────────────────────────────────────────
function WAButton({ size = "md", label = "📲 רוצה לראות דמו ←" }: { size?: "sm" | "md" | "lg"; label?: string }) {
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
    <main dir="rtl" style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* ── URGENCY BANNER ── */}
      <div style={{ background: "var(--gold)", color: "#000", textAlign: "center", padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
        ⚡ נשארו {SPOTS_LEFT} מקומות בלבד לעונת הבחירות 2026 — אל תפספס
      </div>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 900, fontSize: 22, color: "var(--gold)", letterSpacing: -0.5 }}>Campanha</span>
          <WAButton size="sm" label="📲 דברו איתנו" />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 72px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 16px", fontSize: 12, color: "var(--muted)", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          מופעל על ידי D-ID AI · V3 Instant Avatar Technology
        </div>

        <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: "var(--text)" }}>
          המתחרה שלך כבר מפרסם<br />
          <span style={{ color: "var(--gold)" }}>20 סרטונים בחודש.</span><br />
          אתה מפרסם 3.
        </h1>

        <p style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: "var(--muted)", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.8 }}>
          Campanha נותנת לך <strong style={{ color: "var(--text)" }}>אווטר AI</strong> שנראה ונשמע בדיוק כמוך.
          כתוב טקסט — קבל סרטון מוכן תוך 60 שניות. ללא מצלמה. ללא עורך. ללא שעות.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <WAButton size="lg" label="🚀 רוצה דמו חינמי ←" />
          <Link href="/"
            style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 24px", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
            כניסה לאפליקציה
          </Link>
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {["✓ דמו ראשון חינם", "✓ ללא כרטיס אשראי", "✓ תוצאות תוך 30 דקות"].map(t => (
            <span key={t} style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { to: 60, suffix: " שניות", label: "מכתיבה לסרטון מוכן" },
            { to: 5, suffix: " סרטונים", label: "בלחיצה אחת — Campaign Burst" },
            { to: 30, suffix: " שעות", label: "נחסכות בממוצע לחודש" },
            { to: 100, suffix: "%", label: "פנים וקול שלך — לא של אחר" },
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
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textAlign: "center", textTransform: "uppercase" }}>חישוב החזר השקעה</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 40, textAlign: "center", color: "var(--text)" }}>
          כמה עולה לך כרגע לייצר תוכן?
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 40 }}>
          {/* Without */}
          <div style={{ background: "var(--card)", border: "1px solid #e55", borderRadius: 16, padding: 28 }}>
            <p style={{ fontWeight: 800, color: "#e55", marginBottom: 20, fontSize: 16 }}>❌ בלי Campanha</p>
            {[
              ["שעות הכנה לסרטון", "3–5 שעות"],
              ["עלות לסרטון", "₪800–3,000"],
              ["סרטונים בחודש", "2–3 בלבד"],
              ["עלות חודשית", "₪3,000–9,000"],
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
            <p style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 20, fontSize: 16 }}>✓ עם Campanha</p>
            {[
              ["שעות הכנה לסרטון", "< 5 דקות"],
              ["עלות לסרטון", "כמעט ₪0"],
              ["סרטונים בחודש", "ללא הגבלה"],
              ["עלות חודשית", "₪3,500 פעם אחת"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>החבילה מחזירה את עצמה אחרי</p>
          <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--gold)" }}>2 סרטונים בלבד</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>לעומת עלות הפקה מסורתית</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>כיצד זה עובד</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 8, textAlign: "center", color: "var(--text)" }}>
            שלושה שלבים. פעם אחת.
          </h2>
          <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 52, fontSize: 15 }}>
            השלבים הראשונים — <strong style={{ color: "var(--text)" }}>רק פעם אחת בחיים.</strong> אחר כך: כתוב נאום → קבל סרטון.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { n: "1", icon: "🎥", title: "הקלט את עצמך", time: "10 דקות · פעם אחת בחיים", body: "מצלמה ביתית, תאורה טובה, רקע נקי. מקריא טקסט קצר לאישור, ומדבר טבעית 2–5 דקות. זהו.", tag: "חד-פעמי" },
              { n: "2", icon: "🤖", title: "AI בונה אווטר שלך", time: "5–10 דקות · אוטומטי לחלוטין", body: "לא עושה כלום. D-ID V3 לומד את הפנים, הקול, תנועות השפתיים והדיבור הייחודי שלך.", tag: "אוטומטי" },
              { n: "3", icon: "⚡", title: "כתוב → קבל סרטון", time: "60 שניות לסרטון", body: "כותב נאום (או AI כותב בשבילך). לוחץ ״צור סרטון״. בתוך דקה — וידאו מוכן לשיתוף ב-WhatsApp.", tag: "∞ ללא הגבלה" },
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
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>מה מקבלים</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: "var(--text)" }}>
          כלים שמשנים את הקמפיין
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { icon: "⚡", title: "Campaign Burst", hot: true, body: "כתוב נושא אחד → AI מייצר 5 נאומים לקהלים שונים — צעירים, ותיקים, הורים, עסקים. כל 5 הסרטונים נוצרים בבת-אחת." },
            { icon: "✦", title: "AI כותב את הנאום", body: "כתוב ״תחבורה ציבורית, רמת גן, קהל ותיקים״ — AI כותב נאום מלא, משכנע, ב-3 שפות." },
            { icon: "📲", title: "שיתוף ישיר ל-WhatsApp", body: "כפתור שיתוף בכל סרטון. ישר מהאפליקציה לטלפון של הבוחרים — ללא הורדה, ללא העלאה." },
            { icon: "📝", title: "כתוביות אוטומטיות", body: "כל סרטון מגיע עם כתוביות מסונכרנות. חיוני — 70% מהצפיות ברשתות הן ללא קול." },
            { icon: "🌍", title: "עברית, אנגלית, פורטוגזית", body: "ממשק מלא ב-3 שפות. מושלם לקהלים רב-תרבותיים ולקמפיין עם עולים חדשים." },
            { icon: "🔒", title: "מוגן משפטית", body: "כל אווטר נוצר עם הסכם הסכמה מפורש. הפנים והקול שלך לא ישמשו ללא אישורך המפורש." },
          ].map(f => (
            <div key={f.title} style={{ background: "var(--card)", border: `1px solid ${f.hot ? "var(--gold)" : "var(--border)"}`, borderRadius: 14, padding: "24px 20px", position: "relative" }}>
              {f.hot && <span style={{ position: "absolute", top: -10, right: 16, background: "var(--gold)", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 999 }}>הכי פופולרי</span>}
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
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>תמחור</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>מחיר אחד. ברור.</h2>
          <p style={{ color: "var(--muted)", marginBottom: 40, fontSize: 15 }}>לא מנויים חודשיים. לא הפתעות. חבילה לכל תקופת הקמפיין.</p>

          <div style={{ background: "var(--bg)", border: "2px solid var(--gold)", borderRadius: 22, padding: "44px 36px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>חבילת קמפיין 2026</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: "4rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>₪3,500</p>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 36 }}>תשלום חד-פעמי · לכל משך הקמפיין</p>

            <div style={{ textAlign: "right", marginBottom: 36 }}>
              {[
                "הגדרת האווטר האישי שלך (פנים + קול)",
                "סרטונים ללא הגבלה לכל משך הקמפיין",
                "Campaign Burst — 5 קהלים בלחיצה אחת",
                "AI כותב נאומים בשבילך",
                "כתוביות אוטומטיות לכל סרטון",
                "שיתוף ישיר WhatsApp / טלגרם",
                "תמיכה אישית לאורך כל הדרך",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 16 }}>✓</span>
                  <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "right" }}>{item}</p>
                </div>
              ))}
            </div>

            <WAButton size="lg" label="📲 אני רוצה להתחיל ←" />

            <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e55" }}>
                ⏳ נשארו {SPOTS_LEFT} מקומות לעונת 2026
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>אנחנו מגבילים לקוחות כדי לשמור על שירות אישי</p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)" }}>✓ דמו חינמי ראשון · ✓ ללא התחייבות · ✓ תוצאות תוך יום</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>שאלות נפוצות</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 40, textAlign: "center", color: "var(--text)" }}>
          תשובות לכל השאלות
        </h2>

        {[
          { q: "האם הסרטונים נראים אמיתיים?", a: "כן — בתנאים הנכונים. D-ID V3 Instant Avatar מייצר תנועות שפתיים, הבעות פנים ותנועות ראש טבעיות. תאורה טובה, רקע נקי, ווידאו באיכות 1080p — והתוצאה נראית מקצועית לחלוטין. לכן אנחנו מתחילים עם דמו כדי שתראה בעיניים שלך לפני שמשלמים כלום." },
          { q: "כמה זמן לוקחת ההגדרה הראשונית?", a: "10 דקות הקלטה + 5–10 דקות עיבוד אוטומטי. אחר כך — כל סרטון נוצר תוך 60 שניות. ההגדרה נעשית פעם אחת בלבד." },
          { q: "כמה סרטונים אני יכול ליצור?", a: "ללא הגבלה לכל משך הקמפיין. אין תשלום לפי סרטון, אין קרדיטים שנגמרים." },
          { q: "מה זה Campaign Burst?", a: "תכתוב נושא אחד — לדוגמה ״תחבורה ציבורית״ — וה-AI מייצר 5 גרסאות שונות של אותו נאום: אחת לצעירים, אחת לותיקים, אחת להורים לילדים, אחת לבעלי עסקים, ואחת כללית. כל 5 הסרטונים נוצרים בו-זמנית." },
          { q: "האם פנים וקול שלי מוגנים?", a: "כן. D-ID מחייבת הסכם הסכמה מפורש לפני כל אימון אווטר. הפנים והקול שלך לא ישמשו לשום מטרה ללא אישורך. האווטר שייך לך בלבד." },
          { q: "מה קורה אחרי הבחירות?", a: "החבילה היא לתקופת הקמפיין. אפשר להמשיך בחבילה חדשה לקמפיין הבא, או לסיים. אין התחייבות מתמשכת." },
        ].map(faq => <FAQ key={faq.q} {...faq} />)}
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: 16, color: "var(--text)", lineHeight: 1.2 }}>
            הבחירות לא מחכות.<br />
            <span style={{ color: "var(--gold)" }}>התחל לייצר תוכן עוד היום.</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            תן לנו 30 דקות — נראה לך דמו עם הפנים שלך. חינם, ללא התחייבות.<br />
            אם לא תתרשם — לא תשלם כלום.
          </p>
          <WAButton size="lg" label="📲 שלח הודעה ב-WhatsApp עכשיו ←" />
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>עונה תוך שעה · {SPOTS_LEFT} מקומות נשארו</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          Campanha · מופעל על ידי D-ID AI · כל הזכויות שמורות
        </p>
      </footer>

      {/* ── FLOATING WA BUTTON ── */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 100,
          background: "#25D366", color: "#fff", borderRadius: 999,
          padding: "14px 22px", fontSize: 15, fontWeight: 800, textDecoration: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", gap: 8,
          opacity: scrolled ? 1 : 0,
          transform: scrolled ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.3s, transform 0.3s",
          pointerEvents: scrolled ? "auto" : "none",
        }}>
        📲 דמו חינמי
      </a>

    </main>
  );
}
