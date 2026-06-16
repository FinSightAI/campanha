<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ⚖️ TSE compliance — AI-content labeling (DO NOT WEAKEN)

This app generates synthetic campaign videos (AI avatars via D-ID) for Brazilian
electoral use. Brazilian electoral law (**TSE Resolução nº 23.610/2019**, updated
for the 2024/2026 elections) **requires** that synthetic AI-generated content be
labeled **explicitly, prominently, and accessibly**, stating that the content was
AI-generated **and which technology was used**. Violations create real legal
exposure for the candidate and the platform.

When changing share, video, or distribution code, you MUST preserve these:

1. **Public watch page** (`app/v/[id]/page.tsx`) — every shared link resolves to a
   page that embeds the video with a prominent, always-visible AI-content banner
   + the technology name (D-ID), in pt-BR. Do **not** revert it to a bare redirect
   to the raw video file (that exposes unlabeled content).
2. **Shares route through the watch page** — WhatsApp/Facebook/native/copy on the
   videos page share the `/v/<trackId>` watch URL (see `shareUrl()` in
   `app/(app)/videos/page.tsx`), never the raw `video.url`, whenever a tracking
   link exists.
3. **Legal acknowledgment + footer** (`app/(app)/LegalNotice.tsx`, mounted in
   `app/(app)/layout.tsx`) — one-time consent (stored as `campanha_legal_ack`) and
   a persistent disclosure footer. Keep the responsibility/72h-24h-ban wording.
4. **In-app AI label** on video cards (`ai_label` key) and the watch-page
   watermark overlay.
5. **Disclosure copy lives in i18n** — `ai_label`, `legal_ack_title`,
   `legal_ack_body`, `legal_ack_accept`, `legal_footer` exist in **all three**
   language blocks (he/en/pt) in `lib/translations.ts`. The pt-BR text is the
   legally operative one for the pilot; keep it accurate to current TSE rules.

**Known gap (intentional, pending product decision):** the label is NOT yet burned
into the downloadable video file — client-side canvas/MediaRecorder doesn't work on
iOS Safari. A baked-in watermark needs server-side ffmpeg. Until then, users are
made responsible (via the acknowledgment) for keeping the label when re-publishing
elsewhere. If you add file-level watermarking, do it server-side.

Sources: TSE Res. 23.610/2019; TSE rules on AI in the 2026 campaign
(tse.jus.br). Treat the pt-BR disclosure strings as legal text — do not casually
reword them; flag changes for review.
