#!/usr/bin/env bash
set -euo pipefail

VERCEL_PROJECT="${VERCEL_PROJECT:-dbcgame}"
VERCEL_SCOPE="${VERCEL_SCOPE:-}"

if command -v vercel >/dev/null 2>&1; then
  VERCEL=(vercel)
else
  VERCEL=(npx --yes vercel)
fi

run_vercel() {
  if [ -n "$VERCEL_SCOPE" ]; then
    "${VERCEL[@]}" "$@" --scope "$VERCEL_SCOPE"
  else
    "${VERCEL[@]}" "$@"
  fi
}

echo "➡️ Using: ${VERCEL[*]}"

echo "➡️ Ensuring project is linked (${VERCEL_PROJECT})..."
if [ ! -f .vercel/project.json ]; then
  run_vercel link --yes --project "$VERCEL_PROJECT"
fi

echo "➡️ Pulling Vercel env/project settings..."
run_vercel pull --yes --environment=production

echo "➡️ Building preview artifact..."
run_vercel build --prod

echo "➡️ Deploying latest local commit to production..."
DEPLOY_OUTPUT="$(run_vercel deploy --prebuilt --prod)"
echo "$DEPLOY_OUTPUT"

echo "✅ Production deploy request sent."
