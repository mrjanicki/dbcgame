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
- Included `tools/generate_assets.py` is a dependency-free offline helper for exporting PNG spritesheets/layers (no Pillow install required).
- Current build focuses on core direction and art pipeline scaffolding so we can iterate quickly with your creative direction.

## Asset export (done for you, no install needed)

I removed the Pillow dependency from the exporter, so you can generate PNG assets with one command:

```bash
cd /workspace/dbcgame
python3 tools/generate_assets.py
```

Generated files are written to `assets/generated/` (they are intentionally not tracked in git to keep PRs small/stable):
- `player_walk.png`
- `clouds.png`
- `trees_line.png`
- `kalisz_blocks.png`
- `ground_tile.png`

If you prefer, you can also run:

```bash
./tools/setup_assets_env.sh
```

It now confirms setup and prints the exact export command.

## GitHub "Update branch" shows 500 error (what you saw)

If GitHub mobile/web shows:
- `Error updating pull request`
- `The server is having problems (500)`

that is usually a **GitHub server-side temporary issue**, not your fault.

### What to do right now

1. Wait 2–10 minutes and tap **Update branch** again.
2. If it still fails, force-refresh the app/page and retry.
3. If still failing, merge locally and push (this bypasses the UI button):

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
# resolve conflicts if any
git push origin <your-branch>
```

### Check if GitHub itself is down

- Open: `https://www.githubstatus.com/`
- If incidents are active, retry later.

### If you want me to keep handling this

I can continue doing branch updates and conflict resolution from here and commit/push-ready changes so you only approve direction.


### About the GitHub mobile 500 error and PNG files

- Your PNGs are **not** the likely cause of the `Update branch` 500 error (your generated PNGs are tiny).
- That error is usually GitHub-side/transient on mobile.
- Still, I hardened the repo by ignoring generated PNGs (`.gitignore`) and marking PNGs as binary (`.gitattributes`) to reduce diff/render pressure.

## One-command branch update (bypass GitHub mobile "Update branch")

Because the mobile UI is currently returning HTTP 500 for you, use this script instead:

```bash
cd /workspace/dbcgame
./tools/update_branch.sh main --push
```

What it does:
- fetches `origin`
- merges `origin/main` into your current branch
- pushes your branch back to `origin` (when `--push` is provided)

If there is a merge conflict, Git will stop and show exactly which files need resolution.

## About Playwright install

I attempted to install Playwright, but package installation in this environment is blocked by proxy/network policy (`403 Forbidden` from package index). This is unrelated to your GitHub mobile `Update branch` 500 error.



## Latest gameplay/art tuning

- Generated assets now use a unified non-alpha green background for consistent export previews.
- Game now uses generated `kalisz_blocks.png` and `trees_line.png` layers in scene rendering.
- Added cloud drift animation, larger player render scale, larger bullets, and a jump animation frame.
- Floor redesigned to light-grey brick tiles with corrected 1:1 ground scroll speed.
