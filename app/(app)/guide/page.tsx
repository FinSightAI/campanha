"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

function Badge({ children, color = "gold" }: { children: React.ReactNode; color?: "gold" | "muted" }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
      style={{
        background: color === "gold" ? "var(--gold)" : "var(--border)",
        color: color === "gold" ? "#000" : "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6 mb-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h2 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>{title}</h2>
      {children}
    </div>
  );
}

function Step({ number, label, children }: { number: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5 last:mb-0">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mt-0.5"
        style={{ background: "var(--gold)", color: "#000" }}
      >
        {number}
      </div>
      <div>
        <p className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>{label}</p>
        {children}
      </div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <span style={{ color: "var(--gold)", flexShrink: 0 }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TimeTag({ label }: { label: string }) {
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>
      ⏱ {label}
    </div>
  );
}

function Callout({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg p-3 mt-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{text}</p>
    </div>
  );
}

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("guide_title")}</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{t("guide_subtitle")}</p>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Badge>{t("guide_phase1_badge")}</Badge>
          <p className="font-bold mt-2 mb-1 text-sm" style={{ color: "var(--text)" }}>{t("guide_phase1_title")}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{t("guide_phase1_desc")}</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Badge color="muted">{t("guide_phase2_badge")}</Badge>
          <p className="font-bold mt-2 mb-1 text-sm" style={{ color: "var(--text)" }}>{t("guide_phase2_title")}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{t("guide_phase2_desc")}</p>
        </div>
      </div>

      {/* PHASE 1 header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-xs font-bold px-3" style={{ color: "var(--gold)" }}>{t("guide_phase1_badge")}</span>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      {/* Step 1 — Consent */}
      <Section title={t("guide_s1_title")}>
        <Callout label={t("guide_s1_why")} text={t("guide_s1_why_answer")} />
        <p className="text-xs font-semibold mt-4 mb-2" style={{ color: "var(--muted)" }}>{t("guide_s1_how")}</p>
        <List items={[
          t("guide_s1_a"),
          t("guide_s1_b"),
          t("guide_s1_c"),
          t("guide_s1_d"),
          t("guide_s1_e"),
        ]} />
        <TimeTag label={t("guide_s1_time")} />
        <div className="mt-4">
          <Link href="/avatar" className="inline-block px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: "var(--gold)", color: "#000" }}>
            {t("nav_avatar")} →
          </Link>
        </div>
      </Section>

      {/* Step 2 — Training */}
      <Section title={t("guide_s2_title")}>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>{t("guide_s2_how")}</p>
        <List items={[
          t("guide_s2_a"),
          t("guide_s2_b"),
          t("guide_s2_c"),
          t("guide_s2_d"),
          t("guide_s2_e"),
          t("guide_s2_f"),
        ]} />
        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          {t("guide_s2_upload")}
        </div>
        <TimeTag label={t("guide_s2_time")} />
      </Section>

      {/* PHASE 2 header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-xs font-bold px-3" style={{ color: "var(--gold)" }}>{t("guide_phase2_badge")}</span>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      {/* Step 3 — Create video */}
      <Section title={t("guide_s3_title")}>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>{t("guide_s3_how")}</p>
        <List items={[
          t("guide_s3_a"),
          t("guide_s3_b"),
          t("guide_s3_c"),
          t("guide_s3_d"),
          t("guide_s3_e"),
        ]} />
        <TimeTag label={t("guide_s3_time")} />
        <div className="mt-4">
          <Link href="/create" className="inline-block px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: "var(--gold)", color: "#000" }}>
            {t("nav_create")} →
          </Link>
        </div>
      </Section>

      {/* Tips */}
      <Section title={t("guide_tips_title")}>
        <List items={[
          t("guide_tip1"),
          t("guide_tip2"),
          t("guide_tip3"),
          t("guide_tip4"),
        ]} />
      </Section>

      {/* FAQ */}
      <Section title={t("guide_faq_title")}>
        <div className="space-y-4">
          {([
            ["guide_q1", "guide_a1"],
            ["guide_q2", "guide_a2"],
            ["guide_q3", "guide_a3"],
            ["guide_q4", "guide_a4"],
          ] as const).map(([q, a]) => (
            <div key={q}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{t(q)}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{t(a)}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
