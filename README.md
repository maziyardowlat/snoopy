# Waliya Cozy Chat

A tiny Vercel chat page with a warm Anthropic-powered companion.

## Character images

Add your own allowed image files here:

- `assets/Snoopy_Peanuts.png`
- `assets/764378_poster.jpg`

Transparent PNGs look best.

## Text button

The `text Maz` button opens a draft text using `MAZI_PHONE_NUMBER` from the environment. The phone number is intentionally not committed to the repo.

## Local setup

1. Copy `.env.example` to `.env`.
2. Add your Anthropic key and text number:

```bash
ANTHROPIC_API_KEY=your_key_here
MAZI_PHONE_NUMBER=+15551234567
```

3. Run it with the Vercel CLI:

```bash
npx vercel dev
```

Then open the local URL Vercel prints.

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add `ANTHROPIC_API_KEY` and `MAZI_PHONE_NUMBER` in the Vercel project environment variables.
4. Deploy.

CLI version:

```bash
vercel env add ANTHROPIC_API_KEY production --sensitive
vercel env add ANTHROPIC_API_KEY preview --sensitive
vercel env add MAZI_PHONE_NUMBER production --sensitive
vercel env add MAZI_PHONE_NUMBER preview --sensitive
vercel --prod
```

Optional: set `ANTHROPIC_MODEL` if you want to use a different Claude model. The default is `claude-haiku-4-5-20251001`.
