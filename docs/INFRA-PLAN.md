# Campanha — Hardening / Infra Plan

What to add to close the remaining audit gaps, what each one fixes, cost, and
effort. **Almost everything has a free tier sufficient for the pilot** — the cost
is mostly engineering effort, not money.

## Priority order

### P0 — Clerk authentication (FREE for the pilot)
- **Fixes:** the #1 critical finding — the API "gate" is a client-exposed
  `NEXT_PUBLIC_` key, so the whole API is effectively open. Also gives a real
  per-user identity (so quota/rate-limit can be per-user, not per-shared-key),
  and route protection for `/(app)` pages.
- **Cost:** Clerk free tier = up to 10,000 monthly active users. $0 for the pilot.
- **Effort:** Medium. `@clerk/nextjs` is already installed. Add `clerkMiddleware`,
  gate the money-spending routes with `auth()`, wire sign-in/sign-out (the profile
  page already has the buttons).
- **You need:** create a Clerk app, add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` +
  `CLERK_SECRET_KEY` to Vercel (this is the long-standing open item).

### P1 — Upstash Redis / Vercel KV (FREE for the pilot)
- **Fixes:** three findings at once —
  1. **Rate limiting** actually works (current in-memory `Map` resets per
     serverless instance → throttles nothing). Use Redis `INCR`+TTL.
  2. **Atomic quota** counter (current read-modify-write races, can overspend
     past the 15-video cap).
  3. **Private storage** for sync/quota state (currently public blobs with
     guessable paths) — move them into KV instead of public Blob.
- **Cost:** Upstash free tier ≈ 10,000 commands/day. $0 for the pilot. (Vercel
  Marketplace → Upstash integrates in a click.)
- **Effort:** Small–Medium. Rewrite `lib/rateLimit.ts` and `lib/quota.ts` against
  Redis; move sync read/write off Blob into KV.

### P2 — CSP hardening (FREE — effort only)
- **Fixes:** drop `script-src 'unsafe-inline' 'unsafe-eval'` so any future XSS
  can't trivially run / exfiltrate the D-ID key from localStorage.
- **Cost:** $0.
- **Effort:** Small. Move the inline service-worker registration to an external
  `/sw-register.js` (or a nonce), then remove the unsafe directives in
  `next.config.ts`.

### P3 — Mobile / a11y polish (FREE — effort only)
- **Fixes:** calendar 44px touch targets + 10px fonts, icon-button `aria-label`s,
  recorder WebM→mp4 preference, first-visit notification (SW controller null),
  guide checklist auto-derive from real progress.
- **Cost:** $0. **Effort:** Small, incremental; safe to do anytime.

## Summary

| Item | Fixes | Money | Effort |
|------|-------|-------|--------|
| Clerk | Open API / no per-user auth (critical) | $0 (free tier) | Medium |
| Upstash KV | Rate limit + atomic quota + private sync/quota | $0 (free tier) | Small–Medium |
| CSP | XSS defense-in-depth | $0 | Small |
| Mobile/a11y | Touch targets, labels, recorder, notifications | $0 | Small |

**Bottom line:** you can close every remaining hardening gap for **$0 in
subscriptions** (Clerk + Upstash free tiers). The investment is engineering time,
not cash — so it fits the "don't spend before getting paid" rule. Recommended
sequence once you decide to harden: **Clerk → Upstash → CSP → polish.**
