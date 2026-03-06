const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const KEY_GREEN = [91, 191, 88];
const PLAYER_SCALE = 7;
const PLAYER_W = 32 * PLAYER_SCALE;
const PLAYER_H = 32 * PLAYER_SCALE;
const GROUND_Y = 408;

const keys = new Set();
const virtualKeys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

function pressed(k) {
  return keys.has(k) || virtualKeys.has(k);
}

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

function buildFallbackPlayer() {
  const walk = [];
  for (let i = 0; i < 4; i++) {
    const [c, cc] = makeCanvas(32, 32);
    drawPx(cc, 10, 7, 11, 7, '#f3f4f5');
    drawPx(cc, 18, 11, 6, 2, '#c93c3f');
    drawPx(cc, 12, 14, 8, 4, '#e6b282');
    drawPx(cc, 9, 18, 14, 8, '#1d2f5b');
    drawPx(cc, 10 + ((i % 2) ? 1 : -1), 26, 5, 4, '#315d99');
    drawPx(cc, 17 + ((i % 2) ? -1 : 1), 26, 5, 4, '#315d99');
    drawPx(cc, 8, 30, 15, 2, '#ebecf6');
    walk.push(c);
  }
  const [idleA, ia] = makeCanvas(32, 32);
  ia.drawImage(walk[0], 0, 0);
  const [idleB, ib] = makeCanvas(32, 32);
  ib.drawImage(walk[0], 0, 0);
  drawPx(ib, 9, 17, 14, 1, '#2d4c8f');
  const [jump, j] = makeCanvas(32, 32);
  j.drawImage(walk[1], 0, 0);
  drawPx(j, 8, 30, 6, 2, '#ebecf6');
  drawPx(j, 18, 27, 6, 2, '#ebecf6');
  const [shoot, s] = makeCanvas(32, 32);
  s.drawImage(walk[2], 0, 0);
  drawPx(s, 22, 20, 8, 2, '#f6d06e');
  return { walk, idle: [idleA, idleB], jump, shoot };
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

const assets = {
  player: buildFallbackPlayer(),
  playerSheet: null,
  cloudsNear: buildCloudFallback(),
  cloudsFar: buildCloudFallback(),
  buildings: null,
  trees: null,
  hills: null,
  ground: buildCoolBrickTile(),
  platformTile: null,
  kiosk: null,
  busStop: null,
  bus: null,
};

async function loadGeneratedAssets() {
  const cloud = await loadImage('./assets/generated/clouds.png');
  const blocks = await loadImage('./assets/generated/kalisz_blocks.png');
  const trees = await loadImage('./assets/generated/trees_line.png');
  const ground = await loadImage('./assets/generated/ground_tile.png');
  const playerWalk = await loadImage('./assets/generated/player_walk.png');
  const hills = await loadImage('./assets/generated/hills.png');
  const platform = await loadImage('./assets/generated/platform_brick.png');
  const kiosk = await loadImage('./assets/generated/kiosk_ruch.png');
  const busStop = await loadImage('./assets/generated/bus_stop.png');
  const bus = await loadImage('./assets/generated/bus_nineties.png');

  if (cloud) {
    assets.cloudsNear = colorKeyToAlpha(cloud);
    assets.cloudsFar = colorKeyToAlpha(cloud);
  }
  if (blocks) assets.buildings = colorKeyToAlpha(blocks);
  if (trees) assets.trees = colorKeyToAlpha(trees);
  if (ground) assets.ground = ground;
  if (playerWalk) assets.playerSheet = colorKeyToAlpha(playerWalk);
  if (hills) assets.hills = colorKeyToAlpha(hills);
  if (platform) assets.platformTile = colorKeyToAlpha(platform);
  if (kiosk) assets.kiosk = colorKeyToAlpha(kiosk);
  if (busStop) assets.busStop = colorKeyToAlpha(busStop);
  if (bus) assets.bus = colorKeyToAlpha(bus);
}

const state = {
  camX: 0,
  bullets: [],
  explosions: [],
  score: 0,
  over: false,
  cloudDriftA: 0,
  cloudDriftB: 0,
  busX: -260,
  muzzleFlash: 0,
  enemies: [],
  player: {
    x: 120, y: 80, vx: 0, vy: 0, face: 1,
    onGround: false, shootCd: 0,
    shooting: 0,
  },
  platforms: [
    { x: 620, y: 340, w: 160, h: 20, angle: 0 },
    { x: 970, y: 310, w: 190, h: 20, angle: -0.24 },
    { x: 1320, y: 355, w: 150, h: 20, angle: 0 },
    { x: 1660, y: 320, w: 180, h: 20, angle: 0.22 },
  ],
};

for (let i = 0; i < 24; i++) {
  state.enemies.push({ x: 700 + i * 220, y: GROUND_Y - 26, w: 22, h: 26, dir: i % 2 ? -1 : 1, alive: true });
}

function reset() {
  state.camX = 0;
  state.bullets = [];
  state.explosions = [];
  state.score = 0;
  state.over = false;
  state.busX = -260;
  state.player = { x: 120, y: 80, vx: 0, vy: 0, face: 1, onGround: false, shootCd: 0, shooting: 0 };
  state.enemies.forEach((e, i) => {
    e.x = 700 + i * 220;
    e.y = GROUND_Y - 26;
    e.alive = true;
    e.dir = i % 2 ? -1 : 1;
  });
}

function shoot() {
  const p = state.player;
  if (p.shootCd > 0) return;
  p.shootCd = 0.15;
  p.shooting = 0.12;
  state.muzzleFlash = 0.08;
  state.bullets.push({ x: p.x + PLAYER_W * 0.53, y: p.y + PLAYER_H * 0.46, vx: 660 * p.face });
}

function createExplosion(x, y) {
  state.explosions.push({ x, y, t: 0.24 });
}

function getPlayerBottomOnPlatform(pl) {
  if (!pl.angle) return pl.y;
  const center = pl.x + pl.w / 2;
  const dx = state.player.x + PLAYER_W / 2 - center;
  return pl.y + dx * pl.angle;
}

function update(dt) {
  if (pressed('r')) reset();
  if (state.over) return;

  const p = state.player;
  const left = pressed('a') || pressed('arrowleft');
  const right = pressed('d') || pressed('arrowright');
  const jump = pressed('w') || pressed('arrowup') || pressed(' ');
  const firing = pressed('j') || pressed('k');

  p.vx = 0;
  if (left) { p.vx = -260; p.face = -1; }
  if (right) { p.vx = 260; p.face = 1; }
  if (jump && p.onGround) { p.vy = -470; p.onGround = false; }
  if (firing) shoot();

  p.shootCd = Math.max(0, p.shootCd - dt);
  p.shooting = Math.max(0, p.shooting - dt);
  state.muzzleFlash = Math.max(0, state.muzzleFlash - dt);

  p.vy += 980 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.onGround = false;

  // Ground collision
  if (p.y > GROUND_Y - PLAYER_H) {
    p.y = GROUND_Y - PLAYER_H;
    p.vy = 0;
    p.onGround = true;
  }

  // Platform collision (flat + angled)
  for (const pl of state.platforms) {
    const pxMid = p.x + PLAYER_W * 0.5;
    if (pxMid >= pl.x && pxMid <= pl.x + pl.w && p.vy >= 0) {
      const topY = getPlayerBottomOnPlatform(pl);
      if (p.y + PLAYER_H >= topY - 5 && p.y + PLAYER_H <= topY + 18) {
        p.y = topY - PLAYER_H;
        p.vy = 0;
        p.onGround = true;
      }
    }
  }

  state.camX = Math.max(0, p.x - 260);
  state.cloudDriftA += dt * 6;
  state.cloudDriftB += dt * 3;
  state.busX += dt * 36;
  if (state.busX > state.camX + W + 320) state.busX = state.camX - 340;

  state.bullets.forEach((b) => (b.x += b.vx * dt));
  state.bullets = state.bullets.filter((b) => b.x > state.camX - 140 && b.x < state.camX + W + 140);

  state.explosions.forEach((e) => { e.t -= dt; });
  state.explosions = state.explosions.filter((e) => e.t > 0);

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    e.x += e.dir * 66 * dt;
    if (Math.abs(e.x - p.x) > 360) e.dir *= -1;

    if (Math.abs(e.x - p.x) < 48 && Math.abs(e.y - (p.y + PLAYER_H * 0.45)) < 44) state.over = true;

    for (const b of state.bullets) {
      if (b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h) {
        e.alive = false;
        createExplosion(e.x + 10, e.y + 12);
        b.x = -9999;
        state.score += 100;
      }
    }
  });
}

function drawParallax(image, factor, y, extraOffset = 0, scale = 1) {
  if (!image) return;
  const layerW = image.width * scale;
  const ox = -(((state.camX * factor) + extraOffset) % layerW);
  for (let x = ox - layerW; x < W + layerW; x += layerW) {
    ctx.drawImage(image, x, y, layerW, image.height * scale);
  }
}

function drawPlatforms() {
  for (const pl of state.platforms) {
    const sx = pl.x - state.camX;
    if (assets.platformTile) {
      const y = pl.y - (pl.angle ? 6 : 0);
      ctx.save();
      ctx.translate(sx + pl.w / 2, y + pl.h / 2);
      ctx.rotate(pl.angle * 0.9);
      ctx.drawImage(assets.platformTile, -pl.w / 2, -pl.h / 2, pl.w, pl.h);
      ctx.restore();
    } else {
      drawPx(ctx, sx, pl.y, pl.w, pl.h, '#9ca6b5');
    }
  }
}

function drawPlayer(t) {
  const p = state.player;
  const px = Math.floor(p.x - state.camX);

  let frame;
  if (p.shooting > 0) {
    frame = assets.player.shoot;
  } else if (!p.onGround) {
    frame = assets.player.jump;
  } else if (Math.abs(p.vx) > 0) {
    if (assets.playerSheet) {
      const index = Math.floor((t * 10) % 4);
      const [tmp, tc] = makeCanvas(32, 32);
      tc.drawImage(assets.playerSheet, index * 32, 0, 32, 32, 0, 0, 32, 32);
      frame = tmp;
    } else {
      frame = assets.player.walk[Math.floor((t * 10) % 4)];
    }
  } else {
    frame = assets.player.idle[Math.floor((t * 3) % 2)];
  }

  if (p.face > 0) {
    ctx.drawImage(frame, px, p.y, PLAYER_W, PLAYER_H);
  } else {
    ctx.save();
    ctx.translate(px + PLAYER_W / 2, p.y + PLAYER_H / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, -PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
    ctx.restore();
  }

  if (state.muzzleFlash > 0 && p.shooting > 0) {
    ctx.fillStyle = '#ffe89f';
    const fx = px + (p.face > 0 ? PLAYER_W * 0.9 : -8);
    const fy = p.y + PLAYER_H * 0.46;
    ctx.fillRect(fx, fy, 12, 6);
  }
}

function render(t) {
  ctx.clearRect(0, 0, W, H);

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2f74d3');
  g.addColorStop(1, '#86aef0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawParallax(assets.hills, 0.1, 210, 0, 1.4);
  drawParallax(assets.cloudsFar, 0.08, 40 + Math.sin(t * 0.35) * 3, state.cloudDriftB, 2.2);
  drawParallax(assets.cloudsNear, 0.14, 88 + Math.sin(t * 0.55) * 4, state.cloudDriftA, 2.8);
  drawParallax(assets.buildings, 0.25, 140, 0, 1.35);
  drawParallax(assets.trees, 0.37, 246, 0, 1.4);

  // moving bus in background
  if (assets.bus) {
    ctx.drawImage(assets.bus, state.busX - state.camX * 0.22, 292, 180, 90);
  }

  // Poland-90s props
  if (assets.kiosk) ctx.drawImage(assets.kiosk, 840 - state.camX, 344, 86, 58);
  if (assets.busStop) ctx.drawImage(assets.busStop, 1140 - state.camX, 312, 62, 88);

  // floor (fixed 1:1 scroll)
  const tileOffset = ((state.camX % 64) + 64) % 64;
  for (let x = -tileOffset - 64; x < W + 64; x += 64) {
    ctx.drawImage(assets.ground, Math.floor(x), GROUND_Y, 64, 64);
  }

  drawPlatforms();

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    const sx = e.x - state.camX;
    drawPx(ctx, sx, e.y, 22, 26, '#742e38');
    drawPx(ctx, sx + 4, e.y + 3, 13, 6, '#f1b46a');
    drawPx(ctx, sx + 3, e.y + 17, 15, 8, '#2e4370');
  });

  state.explosions.forEach((e) => {
    const r = Math.max(2, Math.floor((0.24 - e.t) * 120));
    ctx.fillStyle = '#ffd676';
    ctx.fillRect(e.x - state.camX - r / 2, e.y - r / 2, r, r);
    ctx.fillStyle = '#ff8c41';
    ctx.fillRect(e.x - state.camX - r / 4, e.y - r / 4, r / 2, r / 2);
  });

  state.bullets.forEach((b) => {
    const sx = b.x - state.camX;
    ctx.fillStyle = '#ffd674';
    ctx.fillRect(sx, b.y, 14, 5);
    ctx.fillStyle = '#fff1b3';
    ctx.fillRect(sx + 1, b.y + 1, 10, 2);
  });

  drawPlayer(t);

  ctx.fillStyle = '#0d1522';
  ctx.fillRect(16, 12, 250, 54);
  ctx.strokeStyle = '#f0c96f';
  ctx.strokeRect(16, 12, 250, 54);
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
    ctx.fillText('Press R or Tap ↻', W / 2 - 90, H / 2 + 20);
  }
}

function bindTouchButton(el, mappedKeys) {
  const start = (e) => {
    e.preventDefault();
    mappedKeys.forEach((k) => virtualKeys.add(k));
    el.classList.add('active');
  };
  const end = (e) => {
    e.preventDefault();
    mappedKeys.forEach((k) => virtualKeys.delete(k));
    el.classList.remove('active');
  };
  ['pointerdown', 'touchstart'].forEach((n) => el.addEventListener(n, start, { passive: false }));
  ['pointerup', 'pointercancel', 'pointerleave', 'touchend', 'touchcancel'].forEach((n) => el.addEventListener(n, end, { passive: false }));
}

function setupMobileControls() {
  const controls = document.getElementById('touch-controls');
  if (!controls) return;

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) controls.classList.add('show');

  const map = {
    left: ['a', 'arrowleft'],
    right: ['d', 'arrowright'],
    jump: ['w', 'arrowup', ' '],
    shoot: ['j', 'k'],
    restart: ['r'],
  };

  Object.entries(map).forEach(([id, keysToMap]) => {
    const el = document.querySelector(`[data-btn="${id}"]`);
    if (el) bindTouchButton(el, keysToMap);
  });
}

let prev = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - prev) / 1000);
  prev = now;
  update(dt);
  render(now / 1000);
  requestAnimationFrame(frame);
}

setupMobileControls();
loadGeneratedAssets().finally(() => requestAnimationFrame(frame));
