# Operator Activation Checklist (after the client pays)

Do these once, **after** the pilot payment lands (so you're never out of pocket).
Everything runs on **your** accounts server-side; the client never enters a key.

## 1. Upgrade D-ID to a paid plan
- The current key is a **Trial**, which CANNOT create custom avatars (returns the
  403 "Invalid key=value pair" error). Avatar creation needs **Pro or higher**.
- studio.d-id.com → upgrade → API → copy the new **API Key**.

## 2. Put your keys in Vercel (Production)
From the project dir (`/Users/s/Desktop/TUBI/campanha`):
```bash
# Replace the Trial D-ID key with the Pro one:
vercel env rm DID_API_KEY production --yes --scope finsightai-4755s-projects
vercel env add DID_API_KEY production --scope finsightai-4755s-projects   # paste Pro key

# Add your ElevenLabs key (for voice cloning):
vercel env add ELEVENLABS_API_KEY production --scope finsightai-4755s-projects
```
(Or use the Vercel dashboard → Settings → Environment Variables.)

## 3. Confirm the cost cap
- `CAMPANHA_MONTHLY_VIDEO_LIMIT` defaults to **15**. Set it explicitly if you want
  a different cap. This bounds your D-ID spend per month.

## 4. Redeploy
```bash
vercel --prod --scope finsightai-4755s-projects --yes
```

## 5. Hand off
- Send the client the app link + `PILOT-GUIDE.md`.
- He creates his avatar + clones his voice himself, then generates videos. No keys,
  nothing to send you.

## Notes
- **Cost per month** ≈ D-ID Pro (~$29) + ElevenLabs (~$5) ≈ R$180, covered by the
  R$397 pilot fee. The 15-video cap protects you.
- **Isolation:** fine for one pilot (URL isn't public). For multiple clients with
  true per-user separation, add Clerk auth (see `INFRA-PLAN.md`).
- **If he's unsatisfied:** month-to-month → he just doesn't renew; you're out only
  ~1 month infra. First diagnose source quality (photo/audio) before tier upgrades.
