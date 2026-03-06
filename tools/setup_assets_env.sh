#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r tools/requirements-assets.txt

echo "✅ Pillow environment ready."
echo "Run: source .venv/bin/activate && python tools/generate_assets.py"
