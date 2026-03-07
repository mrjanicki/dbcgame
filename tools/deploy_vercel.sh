#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "➡️ Pulling Vercel env/project settings..."
vercel pull --yes --environment=production

echo "➡️ Building preview artifact..."
vercel build --prod

echo "➡️ Deploying latest local commit to production..."
vercel deploy --prebuilt --prod

echo "✅ Production deploy request sent."
