"use client";

import { useState, useEffect, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useLanguage } from "@/lib/LanguageContext";
import { getDIDHeaders } from "@/lib/didKey";

type Step =
  | "idle"
  | "consent_loading"
  | "consent_ready"
  | "consent_submitting"
  | "consent_verifying"
  | "training_ready"
  | "training"
  | "done"
  | "error";

function VideoUploadField({
  value,
  onChange,
  placeholder,
  disabled,
  uploadLabel,
  uploadingLabel,
  uploadDoneLabel,
  orLabel,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  disabled: boolean;
  uploadLabel: string;
  uploadingLabel: string;
  uploadDoneLabel: string;
  orLabel: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(blob.url);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  }

  const uploaded = value.includes("vercel-storage.com") || value.includes("blob.vercel");

  return (
    <div className="mb-4">
      {/* File picker button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full py-2.5 rounded-lg text-sm font-medium mb-2 transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{
          background: uploaded ? "var(--card)" : "var(--bg)",
          border: `2px dashed ${uploaded ? "var(--gold)" : "var(--border)"}`,
          color: uploading ? "var(--gold)" : uploaded ? "var(--gold)" : "var(--muted)",
        }}
      >
        {uploading ? uploadingLabel : uploaded ? uploadDoneLabel : uploadLabel}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {uploadError && <p className="text-xs mb-2" style={{ color: "#e55" }}>{uploadError}</p>}

      {/* URL fallback */}
      <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{orLabel}</p>
      <input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </div>
  );
}

export default function AvatarPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [avatarName, setAvatarName] = useState("");
  const [consentId, setConsentId] = useState("");
  const [consentText, setConsentText] = useState("");
  const [consentVideoUrl, setConsentVideoUrl] = useState("");
  const [trainingVideoUrl, setTrainingVideoUrl] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("campanha_avatar_id");
    const name = localStorage.getItem("campanha_avatar_name");
    const thumb = localStorage.getItem("campanha_avatar_thumbnail");
    if (id) {
      setAvatarId(id);
      setAvatarName(name || "");
      setThumbnailUrl(thumb || "");
      setStep("done");
    }
  }, []);

  async function startConsent() {
    if (!avatarName.trim()) return;
    setStep("consent_loading");
    setError("");
    try {
      const res = await fetch("/api/create-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ language: "hebrew" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConsentId(data.id);
      setConsentText(data.text);
      setStep("consent_ready");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה");
      setStep("error");
    }
  }

  async function submitConsent() {
    if (!consentVideoUrl.trim()) return;
    setStep("consent_submitting");
    setError("");
    try {
      const res = await fetch(`/api/submit-consent/${consentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ name: avatarName, sourceUrl: consentVideoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("consent_verifying");
      pollConsent(consentId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("err_unknown"));
      setStep("error");
    }
  }

  async function pollConsent(id: string) {
    const MAX = 40;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(interval);
        setError(t("err_consent_timeout"));
        setStep("error");
        return;
      }
      try {
        const res = await fetch(`/api/consent-status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(interval);
          setStep("training_ready");
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(t("err_consent_fail"));
          setStep("error");
        }
      } catch { /* keep polling */ }
    }, 5000);
  }

  async function createAvatar() {
    if (!trainingVideoUrl.trim()) return;
    setStep("training");
    setError("");
    try {
      const res = await fetch("/api/create-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ name: avatarName, consentId, sourceUrl: trainingVideoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      pollAvatar(data.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("err_unknown"));
      setStep("error");
    }
  }

  async function pollAvatar(id: string) {
    const MAX = 120;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX) {
        clearInterval(interval);
        setError(t("err_training_timeout"));
        setStep("error");
        return;
      }
      try {
        const res = await fetch(`/api/avatar-status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(interval);
          localStorage.setItem("campanha_avatar_id", id);
          localStorage.setItem("campanha_avatar_name", avatarName);
          localStorage.setItem("campanha_avatar_voice_id", data.voiceId || "");
          localStorage.setItem("campanha_avatar_thumbnail", data.thumbnailUrl || "");
          setAvatarId(id);
          setVoiceId(data.voiceId || "");
          setThumbnailUrl(data.thumbnailUrl || "");
          setStep("done");
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(t("err_training_fail"));
          setStep("error");
        }
      } catch { /* keep polling */ }
    }, 8000);
  }

  function reset() {
    localStorage.removeItem("campanha_avatar_id");
    localStorage.removeItem("campanha_avatar_name");
    localStorage.removeItem("campanha_avatar_voice_id");
    localStorage.removeItem("campanha_avatar_thumbnail");
    setStep("idle");
    setAvatarName("");
    setConsentId("");
    setConsentText("");
    setConsentVideoUrl("");
    setTrainingVideoUrl("");
    setAvatarId("");
    setVoiceId("");
    setThumbnailUrl("");
    setError("");
  }

  const stepNumber = {
    idle: 1, consent_loading: 1, consent_ready: 2,
    consent_submitting: 2, consent_verifying: 2,
    training_ready: 3, training: 3, done: 4, error: 0,
  }[step] || 1;

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{t("avt_title")}</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t("avt_subtitle")}</p>

      {/* Progress steps */}
      {step !== "done" && step !== "error" && (
        <div className="flex items-center gap-2 mb-8">
          {[t("avt_step_name"), t("avt_step_consent"), t("avt_step_training")].map((label, i) => {
            const n = i + 1;
            const active = stepNumber === n;
            const done = stepNumber > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{
                      background: done ? "var(--gold)" : active ? "var(--gold)" : "var(--border)",
                      color: done || active ? "#000" : "var(--muted)",
                    }}
                  >
                    {done ? "✓" : n}
                  </span>
                  <span className="text-xs" style={{ color: active ? "var(--text)" : "var(--muted)" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && <span style={{ color: "var(--border)" }}>—</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="rounded-xl p-6 text-center mb-6" style={{ background: "var(--card)", border: "1px solid var(--gold)" }}>
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
          )}
          {!thumbnailUrl && <p className="text-4xl mb-3">✓</p>}
          <p className="font-bold text-base mb-1" style={{ color: "var(--gold)" }}>{t("avt_ready_title")}</p>
          <p className="text-sm mb-4" style={{ color: "var(--text)" }}>{avatarName || localStorage.getItem("campanha_avatar_name")}</p>
          <button onClick={reset} className="text-xs underline" style={{ color: "var(--muted)" }}>
            {t("avt_replace")}
          </button>
        </div>
      )}

      {/* STEP 1 — Name */}
      {(step === "idle" || step === "consent_loading") && (
        <div>
          <label className="text-xs block mb-1.5" style={{ color: "var(--muted)" }}>{t("avt_name_label")}</label>
          <input
            type="text"
            placeholder={t("avt_name_placeholder")}
            value={avatarName}
            onChange={(e) => setAvatarName(e.target.value)}
            disabled={step === "consent_loading"}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <button
            onClick={startConsent}
            disabled={!avatarName.trim() || step === "consent_loading"}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            {step === "consent_loading" ? t("avt_loading") : t("avt_continue")}
          </button>
        </div>
      )}

      {/* STEP 2 — Consent */}
      {(step === "consent_ready" || step === "consent_submitting" || step === "consent_verifying") && (
        <div>
          <div className="rounded-xl p-4 mb-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--gold)" }}>{t("avt_consent_read")}</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{consentText}</p>
          </div>
          <VideoUploadField
            value={consentVideoUrl}
            onChange={setConsentVideoUrl}
            placeholder={t("avt_consent_placeholder")}
            disabled={step !== "consent_ready"}
            uploadLabel={t("avt_upload_btn")}
            uploadingLabel={t("avt_uploading")}
            uploadDoneLabel={t("avt_upload_done")}
            orLabel={t("avt_upload_or")}
          />
          {step === "consent_ready" && (
            <button
              onClick={submitConsent}
              disabled={!consentVideoUrl.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              {t("avt_consent_submit")}
            </button>
          )}
          {(step === "consent_submitting" || step === "consent_verifying") && (
            <div className="w-full py-4 rounded-xl text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span className="animate-pulse" style={{ color: "var(--gold)" }}>{t("avt_consent_verifying")}</span>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("avt_consent_wait")}</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — Training video */}
      {(step === "training_ready" || step === "training") && (
        <div>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{t("avt_training_hint")}</p>
          <VideoUploadField
            value={trainingVideoUrl}
            onChange={setTrainingVideoUrl}
            placeholder={t("avt_consent_placeholder")}
            disabled={step === "training"}
            uploadLabel={t("avt_upload_btn")}
            uploadingLabel={t("avt_uploading")}
            uploadDoneLabel={t("avt_upload_done")}
            orLabel={t("avt_upload_or")}
          />
          {step === "training_ready" && (
            <button
              onClick={createAvatar}
              disabled={!trainingVideoUrl.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              {t("avt_training_start")}
            </button>
          )}
          {step === "training" && (
            <div className="w-full py-4 rounded-xl text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span className="animate-pulse" style={{ color: "var(--gold)" }}>{t("avt_training_progress")}</span>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("avt_training_wait")}</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {step === "error" && (
        <div>
          <p className="text-sm mb-4" style={{ color: "#e55" }}>{error}</p>
          <button onClick={reset} className="px-4 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            {t("avt_restart")}
          </button>
        </div>
      )}

      {/* Tips */}
      {step !== "done" && (
        <div className="mt-8 p-4 rounded-xl text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold mb-2" style={{ color: "var(--gold)" }}>{t("avt_tips_title")}</p>
          <ul className="space-y-1" style={{ color: "var(--muted)" }}>
            <li>• {t("avt_tip1")}</li>
            <li>• {t("avt_tip2")}</li>
            <li>• {t("avt_tip3")}</li>
            <li>• {t("avt_tip4")}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
