const store = new Map<string, number[]>();

export function rateLimit(ip: string, limit: number, windowSec = 60): boolean {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;
  const hits = (store.get(ip) ?? []).filter(t => t > cutoff);
  if (hits.length >= limit) return false;
  hits.push(now);
  store.set(ip, hits);
  if (store.size > 5000) {
    for (const [k, v] of store.entries()) {
      if (v.every(t => t < cutoff)) store.delete(k);
    }
  }
  return true;
}
