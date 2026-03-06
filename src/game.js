const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = 430;

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

const palette = {
  outline: '#0b0f18',
  skin: '#e6b282',
  hoodie: '#1d2f5b',
  pants: '#315d99',
  shoes: '#ebecf6',
  capWhite: '#f3f4f5',
  capRed: '#c93c3f',
};

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const cctx = c.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  return [c, cctx];
}

function drawPx(cctx, x, y, w, h, color) {
  cctx.fillStyle = color;
  cctx.fillRect(x, y, w, h);
}

function buildPlayerFrames() {
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
    cctx.lineWidth = 1;
    cctx.strokeRect(11, 6, 10, 8);
    cctx.strokeRect(9, 18, 14, 8);

    frames.push(c);
  }
  return frames;
}

function buildCloudLayer() {
  const [c, cctx] = makeCanvas(512, 96);
  const cols = ['rgba(244,248,252,.75)', 'rgba(221,234,246,.62)', 'rgba(202,220,235,.55)'];
  const positions = [[40, 30], [180, 20], [340, 32], [450, 24]];
  positions.forEach(([x, y], i) => {
    drawPx(cctx, x, y, 46, 12, cols[i % cols.length]);
    drawPx(cctx, x + 8, y - 8, 24, 8, cols[(i + 1) % cols.length]);
    drawPx(cctx, x - 8, y + 8, 18, 8, cols[(i + 2) % cols.length]);
    drawPx(cctx, x + 30, y + 6, 18, 8, cols[(i + 1) % cols.length]);
  });
  return c;
}

function buildBuildings() {
  const [c, cctx] = makeCanvas(1800, 260);
  const colors = [
    ['#e7c680', '#dd8b5c', '#f2e1b6'],
    ['#e3b776', '#d86d4b', '#edd3a6'],
    ['#ebc58a', '#e28f60', '#f5e7bf'],
  ];
  let x = 20;
  for (let i = 0; i < 12; i++) {
    const [a, b, d] = colors[i % colors.length];
    const h = 130 + (i % 3) * 12;
    drawPx(cctx, x, 120 - (h - 130), 130, h, a);
    drawPx(cctx, x + 40, 120 - (h - 130), 34, h, b);
    drawPx(cctx, x + 74, 120 - (h - 130), 56, h, d);

    for (let yy = 140 - (h - 130); yy < 240; yy += 20) {
      for (let xx = x + 8; xx < x + 120; xx += 19) {
        drawPx(cctx, xx, yy, 10, 12, '#2b6eb2');
        drawPx(cctx, xx + 1, yy + 1, 8, 4, '#6da8db');
      }
      drawPx(cctx, x + 40, yy + 10, 32, 3, '#83432d');
    }
    x += 146;
  }

  // atlas-like sign reference
  drawPx(cctx, 790, 98, 44, 44, '#2f5db0');
  cctx.fillStyle = '#cc3f42';
  cctx.beginPath();
  cctx.moveTo(812, 84);
  cctx.lineTo(834, 106);
  cctx.lineTo(812, 128);
  cctx.lineTo(790, 106);
  cctx.fill();
  return c;
}

function buildTrees() {
  const [c, cctx] = makeCanvas(1600, 200);
  for (let i = 0; i < 26; i++) {
    const x = i * 62 + 18;
    drawPx(cctx, x + 12, 128, 8, 44, '#5d3d27');
    drawPx(cctx, x - 6, 88, 44, 40, '#1d7b40');
    drawPx(cctx, x - 12, 96, 56, 30, '#2f9850');
    drawPx(cctx, x + 2, 78, 28, 20, '#53b364');
  }
  // 8-bit pines
  for (let i = 0; i < 8; i++) {
    const x = i * 220 + 12;
    drawPx(cctx, x + 6, 110, 8, 60, '#5d3d27');
    drawPx(cctx, x - 8, 90, 36, 20, '#2c7e47');
    drawPx(cctx, x - 4, 74, 28, 18, '#339352');
    drawPx(cctx, x, 58, 20, 16, '#4fa968');
  }
  return c;
}

function buildGround() {
  const [c, cctx] = makeCanvas(64, 64);
  drawPx(cctx, 0, 0, 64, 64, '#624625');
  for (let y = 0; y < 64; y += 8) {
    for (let x = ((y / 8) % 2) * 4; x < 64; x += 8) drawPx(cctx, x, y, 4, 4, '#7f5d31');
  }
  drawPx(cctx, 0, 0, 64, 12, '#42873f');
  for (let x = 0; x < 64; x += 4) drawPx(cctx, x, 0, 2, 6 + (x % 3), '#58a04f');
  return c;
}

const assets = {
  playerFrames: buildPlayerFrames(),
  clouds: buildCloudLayer(),
  buildings: buildBuildings(),
  trees: buildTrees(),
  ground: buildGround(),
};

const state = {
  camX: 0,
  bullets: [],
  enemies: [],
  score: 0,
  over: false,
  player: { x: 120, y: 200, vx: 0, vy: 0, face: 1, onGround: false, shootCd: 0 },
};

for (let i = 0; i < 20; i++) {
  state.enemies.push({ x: 580 + i * 210, y: GROUND_Y - 26, w: 20, h: 24, dir: i % 2 ? -1 : 1, alive: true });
}

function reset() {
  state.camX = 0; state.bullets = []; state.score = 0; state.over = false;
  state.player = { x: 120, y: 200, vx: 0, vy: 0, face: 1, onGround: false, shootCd: 0 };
  state.enemies.forEach((e, i) => {
    e.x = 580 + i * 210; e.alive = true; e.dir = i % 2 ? -1 : 1;
  });
}

function shoot() {
  const p = state.player;
  if (p.shootCd > 0) return;
  p.shootCd = 0.18;
  state.bullets.push({ x: p.x + 16, y: p.y + 13, vx: 560 * p.face });
}

let prev = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - prev) / 1000); prev = now;
  update(dt); render(now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function update(dt) {
  if (keys.has('r')) reset();
  if (state.over) return;

  const p = state.player;
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has('w') || keys.has('arrowup') || keys.has(' ');
  const firing = keys.has('j') || keys.has('k');

  p.vx = 0;
  if (left) { p.vx = -200; p.face = -1; }
  if (right) { p.vx = 200; p.face = 1; }
  if (jump && p.onGround) { p.vy = -390; p.onGround = false; }
  if (firing) shoot();
  p.shootCd = Math.max(0, p.shootCd - dt);

  p.vy += 820 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.y > GROUND_Y - 32) { p.y = GROUND_Y - 32; p.vy = 0; p.onGround = true; }

  state.camX = Math.max(0, p.x - 220);

  state.bullets.forEach((b) => b.x += b.vx * dt);
  state.bullets = state.bullets.filter((b) => b.x > state.camX - 20 && b.x < state.camX + W + 40);

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    e.x += e.dir * 52 * dt;
    if (Math.abs(e.x - p.x) > 300) e.dir *= -1;

    if (Math.abs(e.x - p.x) < 20 && Math.abs(e.y - p.y) < 20) state.over = true;

    for (const b of state.bullets) {
      if (b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h) {
        e.alive = false; b.x = -9999; state.score += 100;
      }
    }
  });
}

function render(t) {
  ctx.clearRect(0, 0, W, H);

  // sky gradient for SNES-ish scene
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2f74d3'); g.addColorStop(1, '#6ca0ee');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawParallax(assets.clouds, 0.15, 48 + Math.sin(t * 0.35) * 4);
  drawParallax(assets.buildings, 0.35, 140);
  drawParallax(assets.trees, 0.56, 236);

  // ground strip with texture tiles
  for (let x = -64; x < W + 64; x += 64) {
    const gx = Math.floor(x + (state.camX % 64));
    ctx.drawImage(assets.ground, gx, GROUND_Y, 64, 64);
  }

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    const sx = e.x - state.camX;
    drawPx(ctx, sx, e.y, 20, 24, '#742e38');
    drawPx(ctx, sx + 4, e.y + 3, 12, 6, '#f1b46a');
    drawPx(ctx, sx + 3, e.y + 16, 14, 8, '#2e4370');
  });

  // bullets
  state.bullets.forEach((b) => {
    ctx.fillStyle = '#ffd674';
    ctx.fillRect(b.x - state.camX, b.y, 6, 2);
  });

  // player
  const p = state.player;
  const frame = Math.floor((t * 9) % 4);
  const img = p.onGround && Math.abs(p.vx) > 0 ? assets.playerFrames[frame] : assets.playerFrames[0];
  const px = Math.floor(p.x - state.camX);
  if (p.face > 0) {
    ctx.drawImage(img, px, p.y);
  } else {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(img, -px - 32, p.y);
    ctx.restore();
  }

  // ui
  ctx.fillStyle = '#0d1522';
  ctx.fillRect(16, 12, 180, 52);
  ctx.strokeStyle = '#f0c96f';
  ctx.strokeRect(16, 12, 180, 52);
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

function drawParallax(image, factor, y) {
  const ox = -((state.camX * factor) % image.width);
  for (let x = ox; x < W; x += image.width) ctx.drawImage(image, x, y);
}
