// Reads the per-client D-ID key from localStorage and returns it as a header.
// Falls back to the server-side env var when not set.
export function getDIDHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const key = localStorage.getItem("campanha_did_key");
  return key ? { "X-DID-Key": key } : {};
}
