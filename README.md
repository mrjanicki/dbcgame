# dbcgame

Prototype browser game scaffold.

## Non-programmer asset replacement workflow

Drop replacement art into `src/assets/` using these folders and file names:

- `src/assets/characters/player.png`
- `src/assets/characters/enemy_soldier.png`
- `src/assets/projectiles/bullet.png`
- `src/assets/tiles/tileset_ground.png` (example tileset)
- `src/assets/tiles/tileset_props.png` (example tileset)

### Sprite sheet sizes

Use one of these sprite sheet sizes for consistent import/layout in the prototype:

- **64x64** pixels (small actors/projectiles)
- **128x128** pixels (large actors/tiles)

If your art uses a different frame size, re-export to one of the sizes above before replacing files.

### Naming conventions

Keep names exactly as expected by the game loader:

- Player: `player.png`
- Enemy: `enemy_soldier.png`
- Bullet/projectile: `bullet.png`
- Tilesets: start with `tileset_` (for example `tileset_ground.png`, `tileset_props.png`)

### Fallback behavior when assets are missing

If a replacement file is missing or misnamed, the prototype should continue running and use fallback visuals (placeholder rectangles/default textures) instead of crashing. To avoid fallback mode, ensure the file exists at the exact path and name above.

## Run locally

1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Build production bundle:
   - `npm run build`

## Static deployment (Netlify / Vercel)

This project uses Vite. After `npm run build`, deploy the generated static files from:

- `dist/`

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

- Framework preset: **Vite** (or Other)
- Build command: `npm run build`
- Output directory: `dist`
