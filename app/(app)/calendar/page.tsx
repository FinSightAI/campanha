"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/translations";

type CalPlan = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  topic: string;
  audience: string;
  done: boolean;
};

const STORAGE_KEY = "campanha_calendar";

const DAY_NAMES: Record<Lang, string[]> = {
  pt: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  he: ["ראש׳", "שנ׳", "של׳", "רב׳", "חמ׳", "שיש׳", "שב׳"],
};

const MONTH_NAMES: Record<Lang, string[]> = {
  pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  he: ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"],
};

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((day + 6) % 7)); // Mon-based
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function CalendarPage() {
  const { t, lang } = useLanguage();
  const [plans, setPlans] = useState<CalPlan[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [adding, setAdding] = useState<string | null>(null); // date string being added
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newAudience, setNewAudience] = useState("");

  useEffect(() => {
    try {
      setPlans(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch { setPlans([]); }
  }, []);

  function save(updated: CalPlan[]) {
    setPlans(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addPlan(date: string) {
    if (!newTitle.trim() && !newTopic.trim()) return;
    const plan: CalPlan = {
      id: Math.random().toString(36).slice(2),
      date,
      title: newTitle.trim() || newTopic.trim(),
      topic: newTopic.trim(),
      audience: newAudience.trim(),
      done: false,
    };
    save([...plans, plan]);
    setAdding(null);
    setNewTitle("");
    setNewTopic("");
    setNewAudience("");
  }

  function toggleDone(id: string) {
    save(plans.map((p) => p.id === id ? { ...p, done: !p.done } : p));
  }

  function removePlan(id: string) {
    save(plans.filter((p) => p.id !== id));
  }

  const days = getWeekDays(weekAnchor);
  const dayNames = DAY_NAMES[lang] ?? DAY_NAMES.pt;
  const monthNames = MONTH_NAMES[lang] ?? MONTH_NAMES.pt;

  const weekLabel = (() => {
    const first = days[0];
    const last = days[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${monthNames[first.getMonth()]}`;
    }
    return `${first.getDate()} ${monthNames[first.getMonth()]} – ${last.getDate()} ${monthNames[last.getMonth()]}`;
  })();

  const todayStr = toDateStr(new Date());

  const [notifState, setNotifState] = useState<"default" | "granted" | "denied">("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifState(Notification.permission as "default" | "granted" | "denied");
      // Fire notification for today's events if permission already granted
      if (Notification.permission === "granted") fireTodayNotification(plans);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fireTodayNotification(p: CalPlan[]) {
    const today = toDateStr(new Date());
    const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toDateStr(d); })();
    const todayItems = p.filter((x) => x.date === today && !x.done);
    const tomorrowItems = p.filter((x) => x.date === tomorrow && !x.done);
    if (todayItems.length > 0 && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "NOTIFY",
        title: t("notif_today"),
        body: todayItems.map((x) => x.title).join(", "),
      });
    } else if (tomorrowItems.length > 0 && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "NOTIFY",
        title: t("notif_tomorrow"),
        body: tomorrowItems.map((x) => x.title).join(", "),
      });
    }
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifState(perm as "default" | "granted" | "denied");
    if (perm === "granted") fireTodayNotification(plans);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-1 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{t("nav_calendar")}</h1>
        {notifState !== "denied" && (
          <button onClick={notifState === "granted" ? undefined : requestNotifications}
            className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: notifState === "granted" ? "rgba(212,175,55,.15)" : "var(--card)", border: `1px solid ${notifState === "granted" ? "var(--gold)" : "var(--border)"}`, color: notifState === "granted" ? "var(--gold)" : "var(--muted)", cursor: notifState === "granted" ? "default" : "pointer" }}>
            🔔 {notifState === "granted" ? t("notif_enabled") : t("notif_enable")}
          </button>
        )}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {lang === "pt" ? "Planeje seus vídeos da semana" : lang === "en" ? "Plan your weekly videos" : "תכנן את הסרטונים השבועיים"}
      </p>

      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button
          aria-label={lang === "pt" ? "Semana anterior" : lang === "en" ? "Previous week" : "שבוע קודם"}
          onClick={() => { const a = new Date(weekAnchor); a.setDate(a.getDate() - 7); setWeekAnchor(a); }}
          className="px-3 py-1.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          ←
        </button>
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{weekLabel}</span>
        <button
          aria-label={lang === "pt" ? "Próxima semana" : lang === "en" ? "Next week" : "שבוע הבא"}
          onClick={() => { const a = new Date(weekAnchor); a.setDate(a.getDate() + 7); setWeekAnchor(a); }}
          className="px-3 py-1.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          →
        </button>
        <button
          onClick={() => setWeekAnchor(new Date())}
          className="px-3 py-1.5 rounded-lg text-xs font-bold ml-auto transition-opacity hover:opacity-70"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          {lang === "pt" ? "Hoje" : lang === "en" ? "Today" : "היום"}
        </button>
      </div>

      {/* 7-day grid — scrollable on mobile so 7 columns stay usable */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(7, minmax(110px, 1fr))", overflowX: "auto" }}>
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const isToday = dateStr === todayStr;
          const dayPlans = plans.filter((p) => p.date === dateStr);

          return (
            <div
              key={dateStr}
              className="rounded-xl p-3 flex flex-col gap-2 min-h-[180px]"
              style={{
                background: isToday ? "linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.03))" : "var(--card)",
                border: `1px solid ${isToday ? "rgba(212,175,55,.4)" : "var(--border)"}`,
              }}
            >
              {/* Day header */}
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  {dayNames[day.getDay()]}
                </p>
                <p className="text-base font-bold" style={{ color: isToday ? "var(--gold)" : "var(--text)" }}>
                  {day.getDate()}
                </p>
              </div>

              {/* Plans */}
              <div className="flex-1 space-y-1.5">
                {dayPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg p-2 text-xs"
                    style={{
                      background: plan.done ? "rgba(212,175,55,.08)" : "var(--bg)",
                      border: `1px solid ${plan.done ? "rgba(212,175,55,.3)" : "var(--border)"}`,
                      opacity: plan.done ? 0.65 : 1,
                    }}
                  >
                    <p
                      className="font-semibold mb-1 leading-tight truncate"
                      style={{ color: plan.done ? "var(--muted)" : "var(--text)", textDecoration: plan.done ? "line-through" : "none" }}
                    >
                      {plan.title}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {plan.topic && (
                        <Link
                          href={`/create?topic=${encodeURIComponent(plan.topic)}&audience=${encodeURIComponent(plan.audience)}`}
                          className="px-1.5 py-0.5 rounded font-bold"
                          style={{ background: "var(--gold)", color: "#000", fontSize: 10 }}
                        >
                          +
                        </Link>
                      )}
                      <button onClick={() => toggleDone(plan.id)} className="transition-opacity hover:opacity-60" style={{ color: "var(--gold)", fontSize: 10 }}>
                        {plan.done ? "↺" : "✓"}
                      </button>
                      <button onClick={() => removePlan(plan.id)} className="transition-opacity hover:opacity-60" style={{ color: "var(--muted)", fontSize: 10 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add plan */}
              {adding === dateStr ? (
                <div className="space-y-1.5">
                  <input
                    autoFocus
                    type="text"
                    placeholder={lang === "pt" ? "Título" : lang === "en" ? "Title" : "כותרת"}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-2 py-1 rounded outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--gold)", color: "var(--text)", fontSize: 16 }}
                  />
                  <input
                    type="text"
                    placeholder={lang === "pt" ? "Tema do vídeo" : lang === "en" ? "Video topic" : "נושא"}
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-2 py-1 rounded outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 16 }}
                  />
                  <input
                    type="text"
                    placeholder={lang === "pt" ? "Público" : lang === "en" ? "Audience" : "קהל"}
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full px-2 py-1 rounded outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 16 }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => addPlan(dateStr)}
                      className="flex-1 py-2 rounded text-sm font-bold"
                      style={{ background: "var(--gold)", color: "#000" }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => { setAdding(null); setNewTitle(""); setNewTopic(""); setNewAudience(""); }}
                      className="flex-1 py-2 rounded text-sm"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(dateStr)}
                  className="w-full py-1 rounded text-xs font-bold transition-opacity hover:opacity-70"
                  style={{ border: "1px dashed var(--border)", color: "var(--muted)" }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
        <span style={{ color: "var(--gold)" }}>◆</span>
        <span>{lang === "pt" ? "Clique '+' em cada vídeo planejado para ir direto ao Criar Vídeo" : lang === "en" ? "Click '+' on any plan to go directly to Create Video" : "לחץ '+' בתוכנית כדי לעבור ישירות לצור וידאו"}</span>
      </div>
    </div>
  );
}
