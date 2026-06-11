// Reads the per-client D-ID key from localStorage and returns it as a header.
// Falls back to the server-side env var when not set.
// Strips "Basic " prefix so routes can safely prepend it without doubling.
export function getDIDHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const key = localStorage.getItem("campanha_did_key");
  if (!key) return {};
  return { "X-DID-Key": key.replace(/^Basic\s+/i, "") };
}
