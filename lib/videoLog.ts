import { put, list } from "@vercel/blob";

export type LogEntry = {
  ts: string;
  success: boolean;
  provider: "did" | "heygen";
  estimatedSec: number;
  videoId?: string;
  error?: string;
  clientId: string; // first 8 chars of quota key (anonymous)
};

export async function writeLog(entry: LogEntry): Promise<void> {
  try {
    const d = new Date(entry.ts);
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 8);
    const key = `logs/${month}/${entry.ts.replace(/[:.]/g, "-")}-${rand}.json`;
    await put(key, JSON.stringify(entry), { access: "public", addRandomSuffix: false });
  } catch (e) {
    console.error("[videoLog] failed to write log", e);
  }
}

export async function readLogs(months = 2): Promise<LogEntry[]> {
  const entries: LogEntry[] = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    let cursor: string | undefined;
    do {
      const res = await list({ prefix: `logs/${month}/`, cursor, limit: 1000 });
      await Promise.all(
        res.blobs.map(async (b) => {
          try {
            const r = await fetch(b.url, { cache: "no-store" });
            if (r.ok) entries.push(await r.json());
          } catch { /* skip corrupt entry */ }
        })
      );
      cursor = res.cursor;
    } while (cursor);
  }
  return entries.sort((a, b) => b.ts.localeCompare(a.ts));
}
