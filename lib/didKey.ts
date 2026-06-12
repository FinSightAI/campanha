export function getDIDHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  const appKey = process.env.NEXT_PUBLIC_CAMPANHA_KEY;
  if (appKey) headers["x-campanha-key"] = appKey;
  const didKey = localStorage.getItem("campanha_did_key");
  if (didKey) headers["X-DID-Key"] = didKey.replace(/^Basic\s+/i, "");
  return headers;
}

export function getAppHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const key = process.env.NEXT_PUBLIC_CAMPANHA_KEY;
  return key ? { "x-campanha-key": key } : {};
}
