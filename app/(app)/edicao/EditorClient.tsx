"use client";

import { useEffect, useRef, useState } from "react";

type VideoEntry = {
  id: string; url: string; script: string; name?: string;
  trackId?: string; createdAt: string;
  editName?: string; editRole?: string; editColor?: string;
};

type Edits = { name: string; role: string; color: string };

const COLORS = ["#ffffff", "#e6c25a", "#4ade80", "#60a5fa", "#f87171"];

export default function EditorClient({ isPro }: { isPro: boolean }) {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [selected, setSelected] = useState<VideoEntry | null>(null);
  const [edits, setEdits] = useState<Edits>({ name: "", role: "", color: "#ffffff" });
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      const vids: VideoEntry[] = JSON.parse(localStorage.getItem("campanha_videos") || "[]");
      setVideos(vids.reverse());
      if (vids.length > 0) select(vids[0]);
    } catch { /* empty */ }
  }, []);

  function select(v: VideoEntry) {
    setSelected(v);
    setEdits({ name: v.editName ?? "", role: v.editRole ?? "", color: v.editColor ?? "#ffffff" });
    setSaved(false);
  }

  function saveEdits() {
    if (!selected) return;
    const updated = videos.map((v) =>
      v.id === selected.id
        ? { ...v, editName: edits.name, editRole: edits.role, editColor: edits.color }
        : v
    );
    setVideos(updated);
    setSelected({ ...selected, editName: edits.name, editRole: edits.role, editColor: edits.color });
    localStorage.setItem("campanha_videos", JSON.stringify([...updated].reverse()));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  const card: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
  };

  return (
    <div className="p-8 max-w-4xl" style={{ color: "var(--text)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 22 }}>✂️</span>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Edição de Vídeo</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Adicione nome, cargo e identidade visual aos seus vídeos
          </p>
        </div>
        {isPro && (
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: "1px",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: 20,
            background: "rgba(230,194,90,.15)", color: "var(--gold)", border: "1px solid rgba(230,194,90,.3)",
          }}>Pro</span>
        )}
      </div>

      {videos.length === 0 ? (
        <div style={{ ...card, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎬</p>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>Nenhum vídeo gerado ainda.</p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            Gere seu primeiro vídeo em <a href="/create" style={{ color: "var(--gold)" }}>Criar Vídeo</a>.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>

          {/* Video list */}
          <div style={{ ...card, padding: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 520, overflowY: "auto" }}>
            {videos.map((v) => {
              const active = selected?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => select(v)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8,
                    background: active ? "rgba(230,194,90,.13)" : "transparent",
                    border: `1px solid ${active ? "rgba(230,194,90,.35)" : "transparent"}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--gold)" : "var(--text)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.name || v.script?.slice(0, 30) || "Vídeo"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{fmt(v.createdAt)}</div>
                  {(v.editName || v.editRole) && (
                    <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 3 }}>✓ editado</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Editor panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Preview */}
            {selected && (
              <div style={{ ...card, overflow: "hidden", position: "relative", aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  src={selected.url}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {/* Lower thirds overlay */}
                {(edits.name || edits.role) && (
                  <div style={{
                    position: "absolute", bottom: 36, left: 0, right: 0,
                    padding: "0 20px", pointerEvents: "none",
                  }}>
                    <div style={{
                      display: "inline-block",
                      background: "rgba(0,0,0,.72)",
                      backdropFilter: "blur(4px)",
                      padding: "8px 16px",
                      borderLeft: `4px solid ${edits.color}`,
                      borderRadius: "0 6px 6px 0",
                    }}>
                      {edits.name && (
                        <div style={{ fontSize: 15, fontWeight: 800, color: edits.color, lineHeight: 1.2 }}>
                          {edits.name}
                        </div>
                      )}
                      {edits.role && (
                        <div style={{ fontSize: 12, color: "#e0e0e0", marginTop: 2 }}>
                          {edits.role}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tools */}
            <div style={{ ...card, padding: 24, position: "relative", overflow: "hidden" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                color: "var(--gold)", marginBottom: 20 }}>Lower Thirds</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                    Nome do candidato
                  </label>
                  <input
                    value={edits.name}
                    onChange={(e) => { setEdits({ ...edits, name: e.target.value }); setSaved(false); }}
                    placeholder="Ex: João Silva"
                    disabled={!isPro}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
                      background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)",
                      opacity: isPro ? 1 : 0.4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                    Cargo / Título
                  </label>
                  <input
                    value={edits.role}
                    onChange={(e) => { setEdits({ ...edits, role: e.target.value }); setSaved(false); }}
                    placeholder="Ex: Vereador · PT"
                    disabled={!isPro}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
                      background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)",
                      opacity: isPro ? 1 : 0.4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 8 }}>
                    Cor de destaque
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => isPro && setEdits({ ...edits, color: c })}
                        style={{
                          width: 28, height: 28, borderRadius: "50%", background: c, cursor: isPro ? "pointer" : "default",
                          border: edits.color === c ? "3px solid var(--gold)" : "2px solid var(--border)",
                          opacity: isPro ? 1 : 0.35,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {isPro ? (
                  <button
                    onClick={saveEdits}
                    style={{
                      marginTop: 4, padding: "11px 0", borderRadius: 8, fontWeight: 700, fontSize: 14,
                      background: saved ? "rgba(74,222,128,.2)" : "var(--gold)",
                      color: saved ? "#4ade80" : "#000", border: saved ? "1px solid #4ade80" : "none",
                      cursor: "pointer", transition: "all .2s",
                    }}
                  >
                    {saved ? "✓ Salvo" : "Salvar edições"}
                  </button>
                ) : (
                  <div style={{ marginTop: 4, padding: "14px 16px", borderRadius: 10,
                    background: "rgba(230,194,90,.06)", border: "1px solid rgba(230,194,90,.2)", textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>🔒</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>
                      Disponível no plano Pro
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Edite seus vídeos com nome, cargo e identidade visual.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
