# Jewel Stone — Deploy to Vercel + connect thejewelstone.com

Code is deploy-ready: production build passes (132 pages), `.vercelignore` excludes the
~5 GB of source media so only the app + `public/` upload.

The steps that need **your** login/account (I'm not permitted to create accounts or
authenticate for you) are marked **[you]**. I can drive everything else once you're logged in.

---

## A · Create the Vercel account  **[you]**
1. In Chrome, open **vercel.com** → **Sign Up**.
2. Choose **Continue with Google**, pick **stonejewel41@gmail.com**.
3. Accept the Hobby (free) plan for now.

## B · Deploy — pick ONE path

### Path 1 — Vercel CLI (fastest, no GitHub push)
```bash
npm i -g vercel
vercel login          # [you] opens browser, authorize with the Google account
vercel                # first run: link project — accept defaults, name "jewel-stone"
vercel --prod         # builds & deploys; prints the live *.vercel.app URL
```
`.vercelignore` keeps the upload small. Say the word after `vercel login` and I'll run the rest.

### Path 2 — GitHub import (dashboard)
Needs the current work committed + pushed first (92 uncommitted entries right now).
1. **[ask me]** I'll commit + push to `github.com/viralfaceless25-sketch/jewel-stone`.
2. Vercel dashboard → **Add New → Project** → import that repo → **Deploy**.

## C · Environment variables (Vercel → Project → Settings → Environment Variables)
Without these, pages render but checkout/emails/custom-requests fail at runtime. Add:

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` = `https://thejewelstone.com` | canonical URLs, checkout, emails |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | payments (use test keys first) |
| `RESEND_API_KEY`, `ORDER_TO_EMAIL`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` | email |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | custom-request storage |

Redeploy after adding them.

## D · Connect thejewelstone.com  **[you approve the DNS change]**
1. Vercel → Project → **Settings → Domains** → add `thejewelstone.com` and `www.thejewelstone.com`.
2. Vercel shows exact records. Typically:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
3. In the **GoDaddy** tab → your domain → **DNS** → Manage Records → set those values
   (edit the existing `A`/`CNAME`, or add them). **This is your registrar; you make the change.**
4. Back in Vercel, wait for "Valid Configuration" (DNS can take 5 min–48 h). HTTPS auto-provisions.

---

## Known deploy caveats
- `public/images` is **1.1 GB** — deploys will be slow and may hit plan limits. Later, move
  media to Vercel Blob / a CDN and keep `public/` lean.
- API routes are dynamic (Node) — Vercel handles them; they just need the env vars above.
- Keep `STRIPE_ALLOW_SIGNATURE_CHECKOUT=false` until durable orders + atomic inventory exist.
