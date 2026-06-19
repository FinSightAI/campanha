"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AcessoForm() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const next = params.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/acesso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, next }),
    });
    if (res.ok) {
      window.location.href = next;
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52,
          background: "linear-gradient(135deg,#e6c25a,#c9a227)",
          borderRadius: 14, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 26, marginBottom: 20,
        }}>🎬</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Campanha IA
        </h1>
        <p style={{ fontSize: 14, color: "#8888a8" }}>
          Digite a senha de acesso para continuar
        </p>
      </div>

      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Senha"
        autoFocus
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: "#12121e", border: `1px solid ${error ? "#e05555" : "#1e1e30"}`,
          color: "#fff", fontSize: 16, outline: "none", marginBottom: 12,
        }}
      />
      {error && (
        <p style={{ color: "#e05555", fontSize: 13, marginBottom: 12 }}>
          Senha incorreta. Tente novamente.
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !pw}
        style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: pw ? "#e6c25a" : "#1e1e30",
          color: pw ? "#000" : "#444",
          fontWeight: 700, fontSize: 15, border: "none",
          cursor: pw ? "pointer" : "default",
          transition: "background .2s",
        }}
      >
        {loading ? "A verificar..." : "Entrar"}
      </button>
    </form>
  );
}

export default function AcessoPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a14",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <Suspense>
        <AcessoForm />
      </Suspense>
    </div>
  );
}
