const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const KEY_GREEN = [91, 191, 88];
const PLAYER_SCALE = 4;
const PLAYER_W = 32 * PLAYER_SCALE;
const PLAYER_H = 32 * PLAYER_SCALE;
const GROUND_Y = 420;

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cctx = c.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  return [c, cctx];
}

function drawPx(cctx, x, y, w, h, color) {
  cctx.fillStyle = color;
  cctx.fillRect(x, y, w, h);
}

function buildPlayerFrames() {
  const palette = {
    outline: '#0b0f18', skin: '#e6b282', hoodie: '#1d2f5b',
    pants: '#315d99', shoes: '#ebecf6', capWhite: '#f3f4f5', capRed: '#c93c3f',
  };
  const frames = [];
  const leg = [[-1, 1], [1, -2], [2, -2], [-2, 1]];
  const arm = [[1, -1], [-1, 1], [-1, 1], [1, -1]];

  for (let i = 0; i < 4; i++) {
    const [c, cctx] = makeCanvas(32, 32);
    const [lx, rx] = leg[i];
    const [ax, ay] = arm[i];

    drawPx(cctx, 11, 6, 10, 8, palette.capWhite);
    drawPx(cctx, 19, 11, 5, 2, palette.capRed);
    drawPx(cctx, 12, 14, 8, 4, palette.skin);
    drawPx(cctx, 9, 18, 14, 8, palette.hoodie);
    drawPx(cctx, 8 + ax, 19 + ay, 4, 7, palette.hoodie);
    drawPx(cctx, 20 - ax, 19 - ay, 4, 7, palette.hoodie);
    drawPx(cctx, 14, 18, 2, 8, '#181a21');
    drawPx(cctx, 10 + lx, 26, 5, 4, palette.pants);
    drawPx(cctx, 17 + rx, 26, 5, 4, palette.pants);
    drawPx(cctx, 9 + lx, 30, 7, 2, palette.shoes);
    drawPx(cctx, 16 + rx, 30, 7, 2, palette.shoes);
    cctx.strokeStyle = palette.outline;
    cctx.strokeRect(11, 6, 10, 8);
    cctx.strokeRect(9, 18, 14, 8);
    frames.push(c);
  }

  const [jump, jctx] = makeCanvas(32, 32);
  jctx.drawImage(frames[1], 0, 0);
  drawPx(jctx, 9, 30, 6, 2, '#ebecf6');
  drawPx(jctx, 17, 28, 6, 2, '#ebecf6');

  return { walk: frames, jump };
}

function buildCloudFallback() {
  const [c, cctx] = makeCanvas(512, 96);
  const cols = ['#f4f8fc', '#ddeaF6', '#cadceb'];
  [[40, 30], [180, 20], [340, 32], [450, 24]].forEach(([x, y], i) => {
    drawPx(cctx, x, y, 46, 12, cols[i % cols.length]);
    drawPx(cctx, x + 8, y - 8, 24, 8, cols[(i + 1) % cols.length]);
    drawPx(cctx, x - 8, y + 8, 18, 8, cols[(i + 2) % cols.length]);
    drawPx(cctx, x + 30, y + 6, 18, 8, cols[(i + 1) % cols.length]);
  });
  return c;
}

function buildCoolBrickTile() {
  const [c, cctx] = makeCanvas(64, 64);
  drawPx(cctx, 0, 0, 64, 64, '#a6adb8');
  for (let row = 0; row < 8; row++) {
    const y = row * 8;
    const offset = row % 2 === 0 ? 0 : 8;
    for (let x = -offset; x < 64; x += 16) {
      drawPx(cctx, x + 1, y + 1, 14, 6, '#c8ced8');
      drawPx(cctx, x + 1, y + 1, 14, 1, '#e6eaf0');
      drawPx(cctx, x + 1, y + 6, 14, 1, '#838a95');
    }
  }
  drawPx(cctx, 0, 0, 64, 10, '#848c98');
  return c;
}

function colorKeyToAlpha(img, key = KEY_GREEN, tolerance = 16) {
  const [c, cctx] = makeCanvas(img.width, img.height);
  cctx.drawImage(img, 0, 0);
  const imageData = cctx.getImageData(0, 0, img.width, img.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - key[0]);
    const dg = Math.abs(d[i + 1] - key[1]);
    const db = Math.abs(d[i + 2] - key[2]);
    if (dr <= tolerance && dg <= tolerance && db <= tolerance) d[i + 3] = 0;
  }
  cctx.putImageData(imageData, 0, 0);
  return c;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const assets = {
  player: buildPlayerFrames(),
  clouds: buildCloudFallback(),
  buildings: null,
  trees: null,
  ground: buildCoolBrickTile(),
};

async function loadGeneratedAssets() {
  const cloud = await loadImage('./assets/generated/clouds.png');
  const blocks = await loadImage('./assets/generated/kalisz_blocks.png');
  const trees = await loadImage('./assets/generated/trees_line.png');
  const ground = await loadImage('./assets/generated/ground_tile.png');

  if (cloud) assets.clouds = colorKeyToAlpha(cloud);
  if (blocks) assets.buildings = colorKeyToAlpha(blocks);
  if (trees) assets.trees = colorKeyToAlpha(trees);
  if (ground) assets.ground = ground;
}

const state = {
  camX: 0,
  bullets: [],
  enemies: [],
  score: 0,
  over: false,
  cloudDrift: 0,
  player: { x: 120, y: 160, vx: 0, vy: 0, face: 1, onGround: false, shootCd: 0 },
};

for (let i = 0; i < 20; i++) {
  state.enemies.push({ x: 640 + i * 230, y: GROUND_Y - 26, w: 22, h: 26, dir: i % 2 ? -1 : 1, alive: true });
}

function reset() {
  state.camX = 0;
  state.bullets = [];
  state.score = 0;
  state.over = false;
  state.player = { x: 120, y: 80, vx: 0, vy: 0, face: 1, onGround: false, shootCd: 0 };
  state.enemies.forEach((e, i) => {
    e.x = 640 + i * 230;
    e.alive = true;
    e.dir = i % 2 ? -1 : 1;
  });
}

function shoot() {
  const p = state.player;
  if (p.shootCd > 0) return;
  p.shootCd = 0.16;
  state.bullets.push({ x: p.x + PLAYER_W / 2, y: p.y + PLAYER_H * 0.42, vx: 620 * p.face });
}

function drawParallax(image, factor, y, extraOffset = 0, scale = 1) {
  if (!image) return;
  const layerW = image.width * scale;
  const ox = -(((state.camX * factor) + extraOffset) % layerW);
  for (let x = ox - layerW; x < W + layerW; x += layerW) {
    ctx.drawImage(image, x, y, layerW, image.height * scale);
  }
}

let prev = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - prev) / 1000);
  prev = now;
  update(dt);
  render(now / 1000);
  requestAnimationFrame(frame);
}

function update(dt) {
  if (keys.has('r')) reset();
  if (state.over) return;

  const p = state.player;
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has('w') || keys.has('arrowup') || keys.has(' ');
  const firing = keys.has('j') || keys.has('k');

  p.vx = 0;
  if (left) { p.vx = -240; p.face = -1; }
  if (right) { p.vx = 240; p.face = 1; }
  if (jump && p.onGround) { p.vy = -440; p.onGround = false; }
  if (firing) shoot();

  p.shootCd = Math.max(0, p.shootCd - dt);
  p.vy += 920 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.y > GROUND_Y - PLAYER_H) {
    p.y = GROUND_Y - PLAYER_H;
    p.vy = 0;
    p.onGround = true;
  }

  state.camX = Math.max(0, p.x - 220);
  state.cloudDrift += dt * 8;

  state.bullets.forEach((b) => (b.x += b.vx * dt));
  state.bullets = state.bullets.filter((b) => b.x > state.camX - 100 && b.x < state.camX + W + 100);

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    e.x += e.dir * 62 * dt;
    if (Math.abs(e.x - p.x) > 340) e.dir *= -1;

    if (Math.abs(e.x - p.x) < 44 && Math.abs(e.y - (p.y + PLAYER_H * 0.45)) < 42) state.over = true;

    for (const b of state.bullets) {
      if (b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h) {
        e.alive = false;
        b.x = -9999;
        state.score += 100;
      }
    }
  });
}

function render(t) {
  ctx.clearRect(0, 0, W, H);

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2f74d3');
  g.addColorStop(1, '#7aa7ef');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawParallax(assets.clouds, 0.12, 34 + Math.sin(t * 0.6) * 4, state.cloudDrift, 2);
  drawParallax(assets.buildings, 0.27, 145, 0, 1.35);
  drawParallax(assets.trees, 0.42, 238, 0, 1.4);

  // floor at 1:1 camera speed (no parallax), wrapped smoothly to avoid jitter
  const tileOffset = ((state.camX % 64) + 64) % 64;
  for (let x = -tileOffset - 64; x < W + 64; x += 64) {
    ctx.drawImage(assets.ground, Math.floor(x), GROUND_Y, 64, 64);
  }

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    const sx = e.x - state.camX;
    drawPx(ctx, sx, e.y, 22, 26, '#742e38');
    drawPx(ctx, sx + 4, e.y + 3, 13, 6, '#f1b46a');
    drawPx(ctx, sx + 3, e.y + 17, 15, 8, '#2e4370');
  });

  state.bullets.forEach((b) => {
    const sx = b.x - state.camX;
    ctx.fillStyle = '#ffd674';
    ctx.fillRect(sx, b.y, 12, 4);
    ctx.fillStyle = '#fff1b3';
    ctx.fillRect(sx + 1, b.y + 1, 8, 2);
  });

  const p = state.player;
  const frame = Math.floor((t * 10) % 4);
  const img = !p.onGround ? assets.player.jump : (Math.abs(p.vx) > 0 ? assets.player.walk[frame] : assets.player.walk[0]);
  const px = Math.floor(p.x - state.camX);

  if (p.face > 0) {
    ctx.drawImage(img, px, p.y, PLAYER_W, PLAYER_H);
  } else {
    ctx.save();
    ctx.translate(px + PLAYER_W / 2, p.y + PLAYER_H / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
    ctx.restore();
  }

  ctx.fillStyle = '#0d1522';
  ctx.fillRect(16, 12, 210, 52);
  ctx.strokeStyle = '#f0c96f';
  ctx.strokeRect(16, 12, 210, 52);
  ctx.fillStyle = '#e5edf7';
  ctx.font = '16px monospace';
  ctx.fillText(`SCORE ${String(state.score).padStart(5, '0')}`, 28, 34);
  ctx.fillText(`X ${Math.floor(state.camX / 10)}`, 28, 54);

  if (state.over) {
    ctx.fillStyle = 'rgba(2,8,17,.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f4d17e';
    ctx.font = '38px monospace';
    ctx.fillText('MISSION FAILED', W / 2 - 170, H / 2 - 16);
    ctx.font = '18px monospace';
    ctx.fillStyle = '#e6edf8';
    ctx.fillText('Press R to restart', W / 2 - 86, H / 2 + 20);
  }
}

loadGeneratedAssets().finally(() => requestAnimationFrame(frame));
