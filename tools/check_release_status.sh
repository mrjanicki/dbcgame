#!/usr/bin/env bash
set -euo pipefail

VERCEL_URL="${VERCEL_URL:-https://dbcgame.vercel.app/}"
EXPECTED_TITLE="${EXPECTED_TITLE:-DBCGame — Kalisz Run & Gun}"

echo "== Local commit =="
LOCAL_SHA="$(git rev-parse --short HEAD)"
echo "HEAD: ${LOCAL_SHA}"

if git remote get-url origin >/dev/null 2>&1; then
  echo "== GitHub remote =="
  ORIGIN_URL="$(git remote get-url origin)"
  echo "origin: ${ORIGIN_URL}"
  if git ls-remote --heads origin >/dev/null 2>&1; then
    echo "origin reachable: yes"
  else
    echo "origin reachable: no (auth/network issue)"
  fi
else
  echo "== GitHub remote =="
  echo "origin: not configured"
fi

echo "== Vercel URL check =="
if command -v curl >/dev/null 2>&1; then
  if BODY="$(curl -sSL --max-time 25 "${VERCEL_URL}" 2>/dev/null)"; then
    if printf "%s" "$BODY" | grep -q "$EXPECTED_TITLE"; then
      echo "vercel status: OK (expected title found)"
    elif printf "%s" "$BODY" | grep -qi 'DEPLOYMENT_NOT_FOUND\|NOT_FOUND\|404'; then
      echo "vercel status: ERROR (deployment not found/404)"
      exit 2
    else
      echo "vercel status: WARN (reachable but expected title not found)"
    fi
  else
    echo "vercel status: WARN (unreachable from this environment)"
  fi
else
  echo "curl missing; cannot verify URL"
fi

echo "== Local playability smoke check =="
python3 -m http.server 8000 >/tmp/dbcgame_smoke.log 2>&1 &
PID=$!
sleep 1
LOCAL_HTML="$(curl -sSL --max-time 10 http://127.0.0.1:8000/ || true)"
kill "$PID" >/dev/null 2>&1 || true
if printf "%s" "$LOCAL_HTML" | grep -q "$EXPECTED_TITLE"; then
  echo "local playability: OK"
else
  echo "local playability: FAIL"
  exit 3
fi

echo "Done."
