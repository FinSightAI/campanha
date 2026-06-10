import Link from "next/link";

// ← עדכן את המספר שלך
const WA_NUMBER = "972500000000";
const WA_MSG = encodeURIComponent("היי, ראיתי את Campanha ואני רוצה לשמוע עוד");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

export const metadata = {
  title: "Campanha — סרטוני קמפיין עם AI | ל-60 שניות",
  description: "הקלט את עצמך פעם אחת. צור עשרות סרטוני קמפיין עם AI תוך שניות.",
};

function GoldDot() {
  return <span style={{ color: "var(--gold)" }}>•</span>;
}

export default function PitchPage() {
  return (
    <main dir="rtl" style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>Campanha</span>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            style={{ background: "#25D366", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            📲 דברו איתנו
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 16px", fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>
          מופעל על ידי D-ID AI · V3 Instant Avatar
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 20, color: "var(--text)" }}>
          הפסק לבזבז שעות<br />
          <span style={{ color: "var(--gold)" }}>על הקלטות קמפיין</span>
        </h1>

        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--muted)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          הקלט את עצמך <strong style={{ color: "var(--text)" }}>פעם אחת בלבד.</strong> אחר כך — כתוב טקסט וקבל סרטון מוכן לפרסום תוך 60 שניות. לכל קהל, לכל נושא, ללא מצלמה.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            style={{ background: "var(--gold)", color: "#000", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 800, textDecoration: "none" }}>
            🚀 רוצה דמו חינמי ←
          </a>
          <Link href="/"
            style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 24px", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
            כניסה לאפליקציה
          </Link>
        </div>
      </section>

      {/* ── PAIN ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>המצב הנוכחי</p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 40, color: "var(--text)" }}>
            כמה שעות הקלטת החודש?
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { num: "3–5", unit: "שעות", label: "לסרטון אחד מוכן לפרסום" },
              { num: "₪800", unit: "–₪3,000", label: "עלות עריכה מקצועית לסרטון" },
              { num: "2–3", unit: "סרטונים", label: "בממוצע לחודש קמפיין" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 20px" }}>
                <p style={{ fontSize: "2rem", fontWeight: 900, color: "#e55", lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", margin: "4px 0 8px" }}>{s.unit}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>הפתרון</p>
        <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 8, textAlign: "center", color: "var(--text)" }}>
          שלושה שלבים. פעם אחת.
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 48, fontSize: 15 }}>השלבים הראשונים נעשים פעם אחת בלבד. אחר כך — רק כתיבה וסרטון.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { n: "1", icon: "🎥", title: "מקליט וידאו אחד", sub: "10 דקות · פעם אחת בחיים", body: "מקליט את עצמך מדבר בצורה טבעית. ה-AI לומד את הפנים, הקול, ומבנה הדיבור שלך.", badge: "חד-פעמי" },
            { n: "2", icon: "🤖", title: "AI בונה את האווטר שלך", sub: "5–10 דקות אוטומטי", body: "בלי שתעשה כלום. המערכת מאמנת מודל AI שנראה ונשמע בדיוק כמוך.", badge: "אוטומטי" },
            { n: "3", icon: "⚡", title: "כותב טקסט → מקבל סרטון", sub: "60 שניות לסרטון", body: "כותב את הנאום (או AI כותב בשבילך) → לוחץ יצירה → סרטון מוכן לשיתוף ב-WhatsApp.", badge: "∞ ללא הגבלה" },
          ].map((s) => (
            <div key={s.n} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{s.n}</span>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: "var(--text)" }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>{s.sub}</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>{s.body}</p>
              <span style={{ display: "inline-block", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{s.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", textAlign: "center" }}>מה מקבלים</p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: "var(--text)" }}>
            כלים שמשנים את הקמפיין
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { icon: "⚡", title: "Campaign Burst", body: "כתוב נושא אחד → AI מייצר 5 גרסאות שונות לקהלים שונים: צעירים, ותיקים, הורים, עסקים. כולם נוצרים בבת-אחת." },
              { icon: "✦", title: "AI כותב את הנאום", body: "לא יודע מה לכתוב? כתוב 'תחבורה ציבורית לרמת גן, קהל ותיקים' — AI כותב לך נאום מלא ומשכנע." },
              { icon: "📲", title: "שיתוף ישיר", body: "כל סרטון מגיע עם כפתורי שיתוף ישיר ל-WhatsApp, טלגרם, ועותק קישור. מהאפליקציה ישירות לטלפון של הבוחרים." },
              { icon: "📝", title: "כתוביות אוטומטיות", body: "כל סרטון מגיע עם כתוביות מסונכרנות — חיוני ל-70% מהצפיות ברשתות שנעשות ללא קול." },
              { icon: "🌍", title: "3 שפות", body: "ממשק מלא בעברית, אנגלית ופורטוגזית. מושלם לקמפיין רב-תרבותי." },
              { icon: "🔒", title: "פרטיות מלאה", body: "האווטר שלך שייך רק לך. מוגן בהסכם הסכמה מפורש. לא ניתן לשימוש ללא אישורך." },
            ].map((f) => (
              <div key={f.title} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px" }}>
                <p style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--text)" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 36, textAlign: "center", color: "var(--text)" }}>
          לפני Campanha / אחרי Campanha
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
            <p style={{ fontWeight: 700, color: "#e55", marginBottom: 20, fontSize: 15 }}>❌ לפני</p>
            {["3–5 שעות הקלטה לסרטון אחד", "צלם, עורך, אחסון — ₪1,000+ לסרטון", "2–3 סרטונים בחודש בגלל הזמן", "כל קהל דורש הקלטה נפרדת", "איחור בפרסום = הפסד תנופה"].map((t) => (
              <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ color: "#e55", flexShrink: 0 }}>✕</span>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--gold)", borderRadius: 16, padding: "28px 24px" }}>
            <p style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 20, fontSize: 15 }}>✓ אחרי</p>
            {["60 שניות מכתיבה לסרטון מוכן", "עלות כמעט אפסית לסרטון", "עשרות סרטונים בחודש", "5 קהלים שונים בלחיצה אחת", "פרסום מיידי, תמיד"].map((t) => (
              <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ color: "var(--gold)", flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>תמחור</p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>מחיר אחד. בהיר.</h2>
          <p style={{ color: "var(--muted)", marginBottom: 40, fontSize: 15 }}>לא מנויים. לא הפתעות. חבילה לכל תקופת הקמפיין.</p>

          <div style={{ background: "var(--bg)", border: "2px solid var(--gold)", borderRadius: 20, padding: "40px 32px", marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 8 }}>חבילת קמפיין</p>
            <p style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>₪3,500</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>תשלום חד-פעמי · לכל תקופת הקמפיין</p>

            <div style={{ textAlign: "right", marginBottom: 32 }}>
              {[
                "הגדרת האווטר האישי שלך (פנים + קול)",
                "סרטונים ללא הגבלה לכל משך הקמפיין",
                "Campaign Burst — 5 קהלים בלחיצה אחת",
                "AI כותב נאומים בשבילך",
                "כתוביות אוטומטיות לכל סרטון",
                "שיתוף ישיר ל-WhatsApp וטלגרם",
                "תמיכה אישית לאורך כל הדרך",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: 14, color: "var(--muted)" }}>{item}</p>
                </div>
              ))}
            </div>

            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", background: "var(--gold)", color: "#000", borderRadius: 12, padding: "16px 24px", fontSize: 16, fontWeight: 800, textDecoration: "none" }}>
              📲 אני רוצה להתחיל ←
            </a>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            <GoldDot /> ללא כרטיס אשראי להתחלה <GoldDot /> דמו חינמי ראשון <GoldDot /> אין התחייבות
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 900, marginBottom: 16, color: "var(--text)" }}>
          הבחירות מתקרבות.<br />
          <span style={{ color: "var(--gold)" }}>המתחרים שלך כבר מייצרים תוכן.</span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
          תן לנו להראות לך דמו עם הפנים שלך — בחינם, ללא התחייבות. 10 דקות. ותחליט.
        </p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: "#25D366", color: "#fff", borderRadius: 14, padding: "18px 40px", fontSize: 18, fontWeight: 800, textDecoration: "none" }}>
          📲 שלח הודעה ב-WhatsApp ←
        </a>
        <p style={{ marginTop: 16, fontSize: 12, color: "var(--muted)" }}>עונה תוך שעה בשעות פעילות</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          Campanha · מופעל על ידי D-ID AI · כל הזכויות שמורות
        </p>
      </footer>

    </main>
  );
}
