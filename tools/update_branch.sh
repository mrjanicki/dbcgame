#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-main}"
AUTO_PUSH="${2:-}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repository."
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$CURRENT_BRANCH" = "HEAD" ]; then
  echo "❌ Detached HEAD. Checkout your feature branch first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree is not clean. Commit/stash your changes first."
  exit 1
fi

echo "➡️ Fetching latest refs from origin..."
git fetch origin

echo "➡️ Merging origin/${BASE_BRANCH} into ${CURRENT_BRANCH}..."
git merge --no-edit "origin/${BASE_BRANCH}"

echo "✅ Branch updated locally."

if [ "$AUTO_PUSH" = "--push" ]; then
  echo "➡️ Pushing ${CURRENT_BRANCH} to origin..."
  git push origin "${CURRENT_BRANCH}"
  echo "✅ Pushed."
else
  echo "ℹ️ To push now, run: git push origin ${CURRENT_BRANCH}"
fi
