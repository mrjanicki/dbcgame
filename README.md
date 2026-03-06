# DBCGame — Kalisz Run & Gun Prototype

A playable **Contra-style side-scrolling run-and-gun prototype** built with plain HTML5 canvas.

This commit sets up the first autonomous vertical slice with:
- Side-scrolling camera and shooting gameplay loop.
- Pixel-art visual style with constrained palette.
- Kalisz-inspired block housing skyline + tree line as parallax layers.
- Slow 8-bit cloud animation in the sky.
- Ground texture tiles.
- Main character sprite (baggy hoodie/silhouette, flat-brim cap with red brim vibe, large shoes) with a 4-frame walk cycle.

## Quick Start

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Controls

- Move: `A/D` or `←/→`
- Jump: `W` or `↑` or `Space`
- Shoot: `J` or `K`
- Restart: `R`

## Notes

- Assets are generated at runtime in transparent offscreen canvases (alpha-enabled pixel layers).
- Included `tools/generate_assets.py` is an optional offline helper for exporting PNG spritesheets/layers once Pillow is available in the environment.
- Current build focuses on core direction and art pipeline scaffolding so we can iterate quickly with your creative direction.


## Enable Pillow (fix for `ModuleNotFoundError: No module named PIL`)

If you see a "not found" error when running `python tools/generate_assets.py`, install Pillow in a virtual environment:

```bash
cd /workspace/dbcgame
./tools/setup_assets_env.sh
source .venv/bin/activate
python tools/generate_assets.py
```

### Manual install (alternative)

```bash
cd /workspace/dbcgame
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r tools/requirements-assets.txt
python tools/generate_assets.py
```

### If install still fails

- Verify Python: `python3 --version`
- Verify pip points to same interpreter: `python -m pip --version`
- Corporate/proxy network: set proxy variables before installing:
  - `export HTTPS_PROXY=http://<proxy-host>:<port>`
  - `export HTTP_PROXY=http://<proxy-host>:<port>`
- Debian/Ubuntu system dependencies (if venv/pip missing):
  - `sudo apt-get update && sudo apt-get install -y python3-venv python3-pip`
