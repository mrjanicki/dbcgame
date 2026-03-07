#!/usr/bin/env bash
set -euo pipefail

if command -v vercel >/dev/null 2>&1; then
  VERCEL_BIN="vercel"
else
  VERCEL_BIN="npx --yes vercel"
fi

echo "➡️ Using: ${VERCEL_BIN}"
echo "➡️ Pulling Vercel env/project settings..."
${VERCEL_BIN} pull --yes --environment=production

echo "➡️ Building preview artifact..."
${VERCEL_BIN} build --prod

echo "➡️ Deploying latest local commit to production..."
${VERCEL_BIN} deploy --prebuilt --prod

echo "✅ Production deploy request sent."
