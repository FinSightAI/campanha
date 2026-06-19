import { readLogs } from "@/lib/videoLog";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const adminKey = process.env.CAMPANHA_ADMIN_KEY;

  if (!adminKey || key !== adminKey) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#e05555", fontFamily: "monospace", fontSize: 16 }}>Acesso negado.</p>
      </div>
    );
  }

  const logs = await readLogs(2);
  const total = logs.length;
  const succeeded = logs.filter((l) => l.success).length;
  const failed = total - succeeded;
  const totalSec = logs.filter((l) => l.success).reduce((s, l) => s + l.estimatedSec, 0);

  const cell: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid #1e1e30", fontSize: 13, color: "#c0c0d8", whiteSpace: "nowrap" };
  const th: React.CSSProperties = { ...cell, color: "#e6c25a", fontWeight: 700, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e8e8f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#e6c25a,#c9a227)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Campanha IA — Painel do Operador</h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total gerados", value: total },
            { label: "Bem-sucedidos", value: succeeded, color: "#4ade80" },
            { label: "Com erro", value: failed, color: failed > 0 ? "#f87171" : "#c0c0d8" },
            { label: "Minutos gerados", value: `${Math.round(totalSec / 60)} min` },
          ].map((s) => (
            <div key={s.label} style={{ background: "#12121e", border: "1px solid #1e1e30", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#8888a8", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color || "#e6c25a" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#12121e", border: "1px solid #1e1e30", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0e0e1a" }}>
                <th style={th}>Data/Hora</th>
                <th style={th}>Status</th>
                <th style={th}>Cliente</th>
                <th style={th}>Duração est.</th>
                <th style={th}>Plataforma</th>
                <th style={th}>ID do Vídeo</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={6} style={{ ...cell, textAlign: "center", color: "#8888a8" }}>Nenhum vídeo gerado ainda.</td></tr>
              )}
              {logs.map((l, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.02)" }}>
                  <td style={cell}>{fmt(l.ts)}</td>
                  <td style={{ ...cell, color: l.success ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                    {l.success ? "✓ OK" : `✗ Erro${l.error ? ` (${l.error.slice(0, 30)})` : ""}`}
                  </td>
                  <td style={{ ...cell, fontFamily: "monospace" }}>{l.clientId}</td>
                  <td style={cell}>{Math.round(l.estimatedSec)}s</td>
                  <td style={{ ...cell, textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>{l.provider}</td>
                  <td style={{ ...cell, fontFamily: "monospace", fontSize: 11, color: "#8888a8" }}>{l.videoId ? l.videoId.slice(0, 24) + "…" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#44445a", textAlign: "center" }}>
          Últimos 2 meses · atualizado em tempo real
        </p>
      </div>
    </div>
  );
}
