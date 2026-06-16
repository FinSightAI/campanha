# Campanha

AI-powered campaign video platform. Generate talking-avatar campaign videos from a script, manage them, and share them via short tracked links — built for political/marketing campaigns.

**Live:** [campanha-one.vercel.app](https://campanha-one.vercel.app)

## What it does

- **AI scripting** — Generate, review, and burst-produce campaign scripts with Google Gemini.
- **Avatar videos** — Create talking-avatar videos through the [D-ID](https://www.d-id.com) API (avatars, consents, scenes/clips), with status polling.
- **Speech analysis** — Analyze speeches/transcripts to extract campaign-ready content.
- **Asset uploads** — Store media via Vercel Blob.
- **Sharing & tracking** — Short links resolve to a labeled `/v/[id]` watch page with view tracking and analytics.
- **Workspace** — Dashboard, create, videos library, calendar, burst, analytics, profile, settings, and guide screens.
- **Multilingual** — UI translations for Portuguese, English, Spanish, and Hebrew (landing currently exposes PT/EN).
- **AI-content labeling** — Synthetic content is labeled per Brazilian electoral law (see [Legal / TSE compliance](#legal--tse-compliance)).

## Tech stack

| Layer    | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling  | Tailwind CSS v4 |
| Auth     | Clerk (`@clerk/nextjs`) |
| AI       | Google Generative AI — Gemini 2.5 Flash |
| Video    | D-ID API |
| Storage  | Vercel Blob (`@vercel/blob`) |
| Hosting  | Vercel |

> ⚠️ This project runs Next.js 16, which has breaking changes vs. earlier versions. Before writing code, read the relevant guide in `node_modules/next/dist/docs/`. See [`AGENTS.md`](./AGENTS.md).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev`   | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint`  | Lint with ESLint |

## Environment variables

Set these in `.env.local` (local) and in the Vercel dashboard (production):

| Variable | Purpose |
|----------|---------|
| `DID_API_KEY` | D-ID API key — base64 of `email:key` from [studio.d-id.com](https://studio.d-id.com) → API |
| `GEMINI_API_KEY` | Google Gemini API key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key — read implicitly by the Clerk SDK |
| `NEXT_PUBLIC_CAMPANHA_KEY` | Optional API gate — if set, requests to `/api/*` must send a matching `x-campanha-key` header (see `middleware.ts`) |

## Project structure

```
app/
  page.tsx              # Landing page
  pitch/                # Pitch page
  (app)/                # Authenticated app shell
    dashboard/ create/ videos/ avatar/ burst/
    calendar/ analytics/ profile/ settings/ guide/
  api/                  # Route handlers
    ai-script/ ai-review/ ai-burst/ analyze-speeches/   # Gemini
    create-avatar/ create-consent/ generate/            # D-ID
    avatar-status/[id]/ consent-status/[id]/ status/[id]/  # polling
    submit-consent/[id]/ upload/ sync/ track/
  v/[id]/               # Short share-link redirect + tracking
lib/
  translations.ts       # pt / en / es / he strings
  LanguageContext.tsx   # Language provider
  rateLimit.ts          # Request rate limiting
  subtitles.ts didKey.ts
middleware.ts           # Optional API key gate on /api/*
next.config.ts          # Security headers + CSP
```

## Security

`next.config.ts` sets strict headers (`X-Frame-Options: DENY`, `nosniff`, HSTS, a CSP, and a locked-down `Permissions-Policy`). API routes can be gated behind `NEXT_PUBLIC_CAMPANHA_KEY` via `middleware.ts`, and rate limiting lives in `lib/rateLimit.ts`.

## Legal / TSE compliance

The app produces **synthetic AI-generated** campaign videos for Brazilian electoral
use. Brazilian electoral law — **TSE Resolução nº 23.610/2019** (updated for the
2024/2026 elections) — requires synthetic content to be labeled **explicitly,
prominently, and accessibly**, disclosing that it was AI-generated **and which
technology** produced it. Failing to do so creates legal exposure for the candidate
and the platform.

How the app meets this:

- **Labeled watch page** — `app/v/[id]/page.tsx` embeds each shared video with a
  prominent, always-visible AI-content banner + the technology name (D-ID), in
  pt-BR. (It is **not** a bare redirect to the raw file — that would expose
  unlabeled content.)
- **Shares route through the watch page** — WhatsApp / Facebook / native / copy
  share the `/v/<trackId>` URL, not the raw video, whenever a tracking link exists.
- **Legal acknowledgment** — `app/(app)/LegalNotice.tsx` (mounted in the app
  layout) shows a one-time consent (`campanha_legal_ack` in `localStorage`) plus a
  persistent disclosure footer covering the user's labeling responsibility and the
  72h-before / 24h-after publishing ban.
- **In-app label** — an AI badge on video cards; disclosure strings live in
  `lib/translations.ts` (`ai_label`, `legal_ack_*`, `legal_footer`) across all
  languages. **The pt-BR text is legally operative — do not casually reword it.**

> **Known gap (intentional):** the label is not yet burned into the downloadable
> video file (client-side canvas/MediaRecorder fails on iOS Safari; a baked-in
> watermark needs server-side ffmpeg). Until then the acknowledgment makes the user
> responsible for keeping the label when re-publishing elsewhere. See
> [`AGENTS.md`](./AGENTS.md) for the full constraints when editing this code.

## Deploy

Deployed on [Vercel](https://vercel.com). Deploys are **manual** (no GitHub auto-deploy is configured) — ship with:

```bash
vercel --prod --scope finsightai-4755s-projects --yes
```

Make sure all environment variables above are configured in the Vercel project settings.
