# DBCGame — Kalisz Run & Gun Prototype

A playable **Contra-style side-scrolling run-and-gun prototype** built with plain HTML5 canvas.

## What's improved in this build

- Better pixel-art scene composition with richer skyline depth, props, and animated lighting.
- More animation states:
  - player run, jump, crouch, shooting pose, muzzle flash
  - enemy walk cycle
  - explosion animation
- Improved gameplay loop:
  - enemy return fire
  - player HP hearts
  - mission complete condition
  - stronger HUD feedback
- Day/night tint cycling and extra ambient movement for a more alive level feel.

## Quick Start (local)

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Controls

- Move: `A/D` or `←/→`
- Crouch: `S` or `↓`
- Jump: `W` or `↑` or `Space`
- Shoot: `J` or `K`
- Restart: `R`

## Vercel deployment

This project is static and works directly on Vercel.

1. Push this repository to GitHub.
2. In Vercel, create a **New Project** and import the repo.
3. Framework preset: **Other** (or leave auto-detected).
4. Build command: _(empty)_
5. Output directory: _(empty / root)_

Vercel will serve `index.html` from the project root.

## Asset export (no install needed)

Generate transparent PNG asset files directly with Python standard library:

```bash
cd /workspace/dbcgame
python3 tools/generate_assets.py
```

Generated files appear in `assets/generated/`:
- `player_walk.png`
- `clouds.png`
- `trees_line.png`
- `kalisz_blocks.png`
- `ground_tile.png`

> Note: PNGs in `assets/generated/` are intentionally not committed to git to avoid binary-file review/upload limitations. Regenerate them locally with `python3 tools/generate_assets.py`.

Optional helper command:

```bash
./tools/setup_assets_env.sh
```

It prints the export command and confirms setup.
