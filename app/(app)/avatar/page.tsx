"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── In-browser recorder ───────────────────────────────────────────────────────

function InBrowserRecorder({
  promptText,
  onUploaded,
  disabled,
  lang,
}: {
  promptText: string;
  onUploaded: (url: string) => void;
  disabled: boolean;
  lang: string;
}) {
  const [phase, setPhase] = useState<"idle" | "live" | "recording" | "uploading" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  async function openCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setPhase("live");
    } catch {
      setError(lang === "pt" ? "Câmera não disponível. Verifique as permissões." : "Camera unavailable. Check permissions.");
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      setPhase("uploading");
      stopStream();
      try {
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `consent-${Date.now()}.${ext}`, { type: mimeType });
        const result = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
        onUploaded(result.url);
        setPhase("done");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Upload error");
        setPhase("live");
      }
    };
    recorder.start(200);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    setPhase("recording");
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "done") {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--gold)" }}>
        <p className="text-2xl mb-1">✅</p>
        <p className="text-sm font-bold" style={{ color: "var(--gold)" }}>
          {lang === "pt" ? "Vídeo gravado e enviado!" : "Video recorded and uploaded!"}
        </p>
      </div>
    );
  }

  if (phase === "uploading") {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p className="text-sm animate-pulse" style={{ color: "var(--gold)" }}>
          {lang === "pt" ? "Enviando vídeo..." : "Uploading video..."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Camera preview */}
      {(phase === "live" || phase === "recording") && (
        <div className="relative">
          <video ref={videoRef} muted playsInline className="w-full" style={{ maxHeight: 220, objectFit: "cover", background: "#000", display: "block" }} />
          {phase === "recording" && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,.7)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e55" }} />
              <span className="text-xs font-bold text-white">{fmt(seconds)}</span>
            </div>
          )}
        </div>
      )}

      {/* Teleprompter text */}
      {(phase === "live" || phase === "recording") && promptText && (
        <div className="px-4 py-3" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--gold)" }}>
            {lang === "pt" ? "Leia em voz alta:" : "Read aloud:"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{promptText}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="p-3" style={{ background: "var(--card)" }}>
        {error && <p className="text-xs mb-2" style={{ color: "#e55" }}>{error}</p>}

        {phase === "idle" && (
          <button onClick={openCamera} disabled={disabled}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}>
            📹 {lang === "pt" ? "Gravar com câmera" : "Record with camera"}
          </button>
        )}
        {phase === "live" && (
          <button onClick={startRecording}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ background: "#e55", color: "#fff" }}>
            ● {lang === "pt" ? "Iniciar gravação" : "Start recording"}
          </button>
        )}
        {phase === "recording" && (
          <button onClick={stopRecording}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}>
            ⏹ {lang === "pt" ? "Parar e enviar" : "Stop and send"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── File upload field (fallback) ─────────────────────────────────────────────

function VideoUploadField({
  value, onChange, placeholder, disabled, uploadLabel, uploadingLabel, uploadDoneLabel, orLabel,
}: {
  value: string; onChange: (url: string) => void; placeholder: string; disabled: boolean;
  uploadLabel: string; uploadingLabel: string; uploadDoneLabel: string; orLabel: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      onChange(blob.url);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  }

  const uploaded = value.includes("vercel-storage.com") || value.includes("blob.vercel");

  return (
    <div>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled || uploading}
        className="w-full py-2.5 rounded-lg text-sm font-medium mb-2 transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ background: uploaded ? "var(--card)" : "var(--bg)", border: `2px dashed ${uploaded ? "var(--gold)" : "var(--border)"}`, color: uploading ? "var(--gold)" : uploaded ? "var(--gold)" : "var(--muted)" }}>
        {uploading ? uploadingLabel : uploaded ? uploadDoneLabel : uploadLabel}
      </button>
      <input ref={fileRef} type="file" accept="video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {uploadError && <p className="text-xs mb-2" style={{ color: "#e55" }}>{uploadError}</p>}
      <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{orLabel}</p>
      <input type="url" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        disabled={disabled} className="w-full px-4 py-3 rounded-lg text-sm outline-none"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AvatarPage() {
  const { t, lang } = useLanguage();
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
  // Toggle between in-browser recorder and URL upload
  const [useRecorder, setUseRecorder] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("campanha_avatar_id");
    const name = localStorage.getItem("campanha_avatar_name");
    const thumb = localStorage.getItem("campanha_avatar_thumbnail");
    if (id) { setAvatarId(id); setAvatarName(name || ""); setThumbnailUrl(thumb || ""); setStep("done"); }
  }, []);

  async function startConsent() {
    if (!avatarName.trim()) return;
    setStep("consent_loading");
    setError("");
    try {
      const res = await fetch("/api/create-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDIDHeaders() },
        body: JSON.stringify({ language: lang === "en" ? "english" : "portuguese" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConsentId(data.id);
      // Pre-fill the person's name in the consent text
      const text: string = data.text ?? "";
      setConsentText(text.replace(/\[user name\]/gi, avatarName).replace(/\[nome do usuário\]/gi, avatarName));
      setStep("consent_ready");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("err_unknown"));
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
      if (attempts > MAX) { clearInterval(interval); setError(t("err_consent_timeout")); setStep("error"); return; }
      try {
        const res = await fetch(`/api/consent-status/${id}`, { headers: getDIDHeaders() });
        const data = await res.json();
        if (data.status === "done") { clearInterval(interval); setStep("training_ready"); }
        else if (data.status === "error") { clearInterval(interval); setError(t("err_consent_fail")); setStep("error"); }
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
      if (attempts > MAX) { clearInterval(interval); setError(t("err_training_timeout")); setStep("error"); return; }
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
    setStep("idle"); setAvatarName(""); setConsentId(""); setConsentText("");
    setConsentVideoUrl(""); setTrainingVideoUrl(""); setAvatarId(""); setVoiceId(""); setThumbnailUrl(""); setError("");
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

      {/* What you'll need */}
      {step === "idle" && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.03))", border: "1px solid rgba(212,175,55,.3)" }}>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--gold)" }}>{t("avt_need_title")}</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              ["📹", lang === "pt" ? "Câmera ou smartphone" : lang === "en" ? "Camera or smartphone" : "מצלמה או סמארטפון"],
              ["☀️", lang === "pt" ? "Boa iluminação" : lang === "en" ? "Good lighting" : "תאורה טובה"],
              ["🎤", lang === "pt" ? "Ambiente silencioso" : lang === "en" ? "Quiet environment" : "סביבה שקטה"],
              ["⏱", lang === "pt" ? "~10 minutos" : lang === "en" ? "~10 minutes" : "~10 דקות"],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: "var(--card)", color: "var(--muted)" }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{t("avt_need_time")}</p>
        </div>
      )}

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
                  <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: done || active ? "var(--gold)" : "var(--border)", color: done || active ? "#000" : "var(--muted)" }}>
                    {done ? "✓" : n}
                  </span>
                  <span className="text-xs" style={{ color: active ? "var(--text)" : "var(--muted)" }}>{label}</span>
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
          {thumbnailUrl && <img src={thumbnailUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />}
          {!thumbnailUrl && <p className="text-4xl mb-3">✓</p>}
          <p className="font-bold text-base mb-1" style={{ color: "var(--gold)" }}>{t("avt_ready_title")}</p>
          <p className="text-sm mb-4" style={{ color: "var(--text)" }}>{avatarName || localStorage.getItem("campanha_avatar_name")}</p>
          <button onClick={reset} className="text-xs underline" style={{ color: "var(--muted)" }}>{t("avt_replace")}</button>
        </div>
      )}

      {/* STEP 1 — Name */}
      {(step === "idle" || step === "consent_loading") && (
        <div>
          <label className="text-xs block mb-1.5" style={{ color: "var(--muted)" }}>{t("avt_name_label")}</label>
          <input type="text" placeholder={t("avt_name_placeholder")} value={avatarName}
            onChange={(e) => setAvatarName(e.target.value)} disabled={step === "consent_loading"}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} />
          <button onClick={startConsent} disabled={!avatarName.trim() || step === "consent_loading"}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: "var(--gold)", color: "#000" }}>
            {step === "consent_loading" ? t("avt_loading") : t("avt_continue")}
          </button>
        </div>
      )}

      {/* STEP 2 — Consent */}
      {(step === "consent_ready" || step === "consent_submitting" || step === "consent_verifying") && (
        <div>
          {/* Recorder / Upload toggle */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setUseRecorder(true)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: useRecorder ? "var(--gold)" : "var(--card)", color: useRecorder ? "#000" : "var(--muted)", border: `1px solid ${useRecorder ? "var(--gold)" : "var(--border)"}` }}>
              📹 {lang === "pt" ? "Gravar agora" : "Record now"}
            </button>
            <button onClick={() => setUseRecorder(false)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: !useRecorder ? "var(--gold)" : "var(--card)", color: !useRecorder ? "#000" : "var(--muted)", border: `1px solid ${!useRecorder ? "var(--gold)" : "var(--border)"}` }}>
              🔗 {lang === "pt" ? "Colar URL" : "Paste URL"}
            </button>
          </div>

          {useRecorder ? (
            <div className="mb-5">
              <InBrowserRecorder
                promptText={consentText}
                onUploaded={(url) => { setConsentVideoUrl(url); }}
                disabled={step !== "consent_ready"}
                lang={lang}
              />
              {consentVideoUrl && step === "consent_ready" && (
                <button onClick={submitConsent}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {t("avt_consent_submit")}
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Consent text display */}
              <div className="rounded-xl p-4 mb-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--gold)" }}>{t("avt_consent_read")}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{consentText}</p>
              </div>
              <VideoUploadField value={consentVideoUrl} onChange={setConsentVideoUrl}
                placeholder={t("avt_consent_placeholder")} disabled={step !== "consent_ready"}
                uploadLabel={t("avt_upload_btn")} uploadingLabel={t("avt_uploading")}
                uploadDoneLabel={t("avt_upload_done")} orLabel={t("avt_upload_or")} />
              {step === "consent_ready" && (
                <button onClick={submitConsent} disabled={!consentVideoUrl.trim()}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {t("avt_consent_submit")}
                </button>
              )}
            </div>
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

          {/* Recorder / Upload toggle */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setUseRecorder(true)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: useRecorder ? "var(--gold)" : "var(--card)", color: useRecorder ? "#000" : "var(--muted)", border: `1px solid ${useRecorder ? "var(--gold)" : "var(--border)"}` }}>
              📹 {lang === "pt" ? "Gravar agora" : "Record now"}
            </button>
            <button onClick={() => setUseRecorder(false)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: !useRecorder ? "var(--gold)" : "var(--card)", color: !useRecorder ? "#000" : "var(--muted)", border: `1px solid ${!useRecorder ? "var(--gold)" : "var(--border)"}` }}>
              🔗 {lang === "pt" ? "Colar URL" : "Paste URL"}
            </button>
          </div>

          {useRecorder ? (
            <div className="mb-4">
              <InBrowserRecorder
                promptText={lang === "pt"
                  ? "Fale naturalmente por pelo menos 1 minuto — sobre qualquer assunto, como se estivesse conversando com eleitores."
                  : "Speak naturally for at least 1 minute — about anything, as if talking to voters."}
                onUploaded={(url) => setTrainingVideoUrl(url)}
                disabled={step === "training"}
                lang={lang}
              />
              {trainingVideoUrl && step === "training_ready" && (
                <button onClick={createAvatar}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {t("avt_training_start")}
                </button>
              )}
            </div>
          ) : (
            <div>
              <VideoUploadField value={trainingVideoUrl} onChange={setTrainingVideoUrl}
                placeholder={t("avt_consent_placeholder")} disabled={step === "training"}
                uploadLabel={t("avt_upload_btn")} uploadingLabel={t("avt_uploading")}
                uploadDoneLabel={t("avt_upload_done")} orLabel={t("avt_upload_or")} />
              {step === "training_ready" && (
                <button onClick={createAvatar} disabled={!trainingVideoUrl.trim()}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                  style={{ background: "var(--gold)", color: "#000" }}>
                  {t("avt_training_start")}
                </button>
              )}
            </div>
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
