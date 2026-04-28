# Waliya Cozy Chat

A tiny Vercel chat page with a warm Anthropic-powered companion.

## Local setup

1. Copy `.env.example` to `.env`.
2. Add your Anthropic key:

```bash
ANTHROPIC_API_KEY=your_key_here
```

3. Run it with the Vercel CLI:

```bash
npx vercel dev
```

Then open the local URL Vercel prints.

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add `ANTHROPIC_API_KEY` in the Vercel project environment variables.
4. Deploy.

Optional: set `ANTHROPIC_MODEL` if you want to use a different Claude model. The default is `claude-3-5-haiku-latest`.
