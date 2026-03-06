const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = 430;
const WORLD_LENGTH = 7200;

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
  c.width = w;
  c.height = h;
  const cctx = c.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  return [c, cctx];
}

function drawPx(cctx, x, y, w, h, color) {
  cctx.fillStyle = color;
  cctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function outlineRect(cctx, x, y, w, h, color = palette.outline) {
  cctx.strokeStyle = color;
  cctx.lineWidth = 1;
  cctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function buildPlayerFrames() {
  const sets = {
    run: [],
    jump: [],
    crouch: [],
    shoot: [],
  };

  const leg = [[-1, 1], [1, -2], [2, -2], [-2, 1], [0, 0], [1, -1]];
  const arm = [[1, -1], [-1, 1], [-1, 1], [1, -1], [2, -2], [2, 0]];

  for (let i = 0; i < 6; i += 1) {
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

    outlineRect(cctx, 11, 6, 10, 8);
    outlineRect(cctx, 9, 18, 14, 8);

    sets.run.push(c);
  }

  // jump frame
  {
    const [c, cctx] = makeCanvas(32, 32);
    drawPx(cctx, 11, 6, 10, 8, palette.capWhite);
    drawPx(cctx, 19, 11, 5, 2, palette.capRed);
    drawPx(cctx, 12, 14, 8, 4, palette.skin);
    drawPx(cctx, 9, 18, 14, 8, palette.hoodie);
    drawPx(cctx, 7, 19, 4, 6, palette.hoodie);
    drawPx(cctx, 21, 19, 4, 6, palette.hoodie);
    drawPx(cctx, 11, 25, 5, 4, palette.pants);
    drawPx(cctx, 16, 25, 5, 4, palette.pants);
    drawPx(cctx, 10, 29, 7, 2, palette.shoes);
    drawPx(cctx, 15, 29, 7, 2, palette.shoes);
    outlineRect(cctx, 11, 6, 10, 8);
    outlineRect(cctx, 9, 18, 14, 8);
    sets.jump.push(c);
  }

  // crouch frame
  {
    const [c, cctx] = makeCanvas(32, 32);
    drawPx(cctx, 11, 10, 10, 8, palette.capWhite);
    drawPx(cctx, 19, 14, 5, 2, palette.capRed);
    drawPx(cctx, 12, 17, 8, 3, palette.skin);
    drawPx(cctx, 8, 21, 16, 6, palette.hoodie);
    drawPx(cctx, 8, 27, 16, 3, palette.pants);
    drawPx(cctx, 8, 30, 7, 2, palette.shoes);
    drawPx(cctx, 17, 30, 7, 2, palette.shoes);
    outlineRect(cctx, 11, 10, 10, 8);
    outlineRect(cctx, 8, 21, 16, 6);
    sets.crouch.push(c);
  }

  // shoot frame
  {
    const [c, cctx] = makeCanvas(32, 32);
    drawPx(cctx, 11, 6, 10, 8, palette.capWhite);
    drawPx(cctx, 19, 11, 5, 2, palette.capRed);
    drawPx(cctx, 12, 14, 8, 4, palette.skin);
    drawPx(cctx, 9, 18, 14, 8, palette.hoodie);
    drawPx(cctx, 8, 19, 4, 7, palette.hoodie);
    drawPx(cctx, 22, 20, 7, 3, palette.hoodie);
    drawPx(cctx, 27, 20, 4, 2, '#707a8b');
    drawPx(cctx, 10, 26, 5, 4, palette.pants);
    drawPx(cctx, 17, 26, 5, 4, palette.pants);
    drawPx(cctx, 9, 30, 7, 2, palette.shoes);
    drawPx(cctx, 16, 30, 7, 2, palette.shoes);
    outlineRect(cctx, 11, 6, 10, 8);
    outlineRect(cctx, 9, 18, 14, 8);
    sets.shoot.push(c);
  }

  return sets;
}

function buildCloudLayer() {
  const [c, cctx] = makeCanvas(800, 120);
  const cols = ['rgba(244,248,252,.80)', 'rgba(221,234,246,.66)', 'rgba(202,220,235,.55)'];
  const positions = [[40, 36], [180, 20], [340, 40], [500, 24], [650, 34]];
  positions.forEach(([x, y], i) => {
    drawPx(cctx, x, y, 52, 14, cols[i % cols.length]);
    drawPx(cctx, x + 10, y - 10, 28, 10, cols[(i + 1) % cols.length]);
    drawPx(cctx, x - 8, y + 10, 18, 10, cols[(i + 2) % cols.length]);
    drawPx(cctx, x + 33, y + 8, 19, 10, cols[(i + 1) % cols.length]);
  });
  return c;
}

function buildBuildings() {
  const [c, cctx] = makeCanvas(2400, 300);
  const colors = [
    ['#e7c680', '#dd8b5c', '#f2e1b6'],
    ['#e3b776', '#d86d4b', '#edd3a6'],
    ['#ebc58a', '#e28f60', '#f5e7bf'],
  ];
  let x = 16;
  for (let i = 0; i < 16; i += 1) {
    const [a, b, d] = colors[i % colors.length];
    const h = 136 + (i % 4) * 10;
    const yTop = 132 - (h - 136);
    drawPx(cctx, x, yTop, 132, h, a);
    drawPx(cctx, x + 41, yTop, 34, h, b);
    drawPx(cctx, x + 75, yTop, 57, h, d);

    for (let yy = yTop + 18; yy < yTop + h - 10; yy += 20) {
      for (let xx = x + 8; xx < x + 124; xx += 19) {
        const lit = (xx + yy + i * 17) % 5 === 0;
        drawPx(cctx, xx, yy, 10, 12, lit ? '#f4d17a' : '#2b6eb2');
        drawPx(cctx, xx + 1, yy + 1, 8, 4, lit ? '#fce8a3' : '#6da8db');
      }
      drawPx(cctx, x + 41, yy + 10, 33, 3, '#83432d');
    }

    drawPx(cctx, x + 22, yTop - 7, 8, 7, '#2b2f3f');
    drawPx(cctx, x + 84, yTop - 11, 8, 11, '#1d2332');
    x += 145;
  }

  drawPx(cctx, 930, 102, 54, 54, '#2f5db0');
  cctx.fillStyle = '#cc3f42';
  cctx.beginPath();
  cctx.moveTo(957, 90);
  cctx.lineTo(982, 117);
  cctx.lineTo(957, 144);
  cctx.lineTo(932, 117);
  cctx.fill();

  return c;
}

function buildTrees() {
  const [c, cctx] = makeCanvas(2200, 220);
  for (let i = 0; i < 34; i += 1) {
    const x = i * 63 + 14;
    drawPx(cctx, x + 13, 143, 8, 48, '#5d3d27');
    drawPx(cctx, x - 5, 96, 45, 42, '#1d7b40');
    drawPx(cctx, x - 13, 105, 58, 33, '#2f9850');
    drawPx(cctx, x + 2, 86, 29, 22, '#53b364');
  }
  for (let i = 0; i < 11; i += 1) {
    const x = i * 212 + 9;
    drawPx(cctx, x + 7, 124, 8, 67, '#5d3d27');
    drawPx(cctx, x - 8, 99, 36, 25, '#2c7e47');
    drawPx(cctx, x - 4, 80, 28, 20, '#339352');
    drawPx(cctx, x, 61, 20, 20, '#4fa968');
  }
  return c;
}

function buildGroundTile() {
  const [c, cctx] = makeCanvas(64, 64);
  drawPx(cctx, 0, 0, 64, 64, '#624625');
  for (let y = 0; y < 64; y += 8) {
    for (let x = ((y / 8) % 2) * 4; x < 64; x += 8) drawPx(cctx, x, y, 4, 4, '#7f5d31');
  }
  drawPx(cctx, 0, 0, 64, 14, '#42873f');
  for (let x = 0; x < 64; x += 4) drawPx(cctx, x, 0, 2, 5 + ((x / 4) % 4), '#58a04f');
  drawPx(cctx, 0, 12, 64, 2, '#2f6a32');
  return c;
}

function buildMuzzleFlashFrames() {
  const frames = [];
  for (let i = 0; i < 3; i += 1) {
    const [c, cctx] = makeCanvas(12, 12);
    drawPx(cctx, 4, 4, 4, 4, i === 1 ? '#fff0a0' : '#ffe07a');
    drawPx(cctx, 2, 5, 8, 2, '#ffd46a');
    drawPx(cctx, 5, 2, 2, 8, '#ffd46a');
    frames.push(c);
  }
  return frames;
}

function buildEnemyFrames() {
  const walk = [];
  for (let i = 0; i < 2; i += 1) {
    const [c, cctx] = makeCanvas(24, 26);
    const shift = i === 0 ? -1 : 1;
    drawPx(cctx, 5, 1, 14, 7, '#f2bc78');
    drawPx(cctx, 3, 8, 18, 10, '#6b2f3a');
    drawPx(cctx, 9 + shift, 18, 5, 6, '#2e4370');
    drawPx(cctx, 4 - shift, 18, 5, 6, '#2e4370');
    drawPx(cctx, 3 - shift, 24, 7, 2, '#7f899c');
    drawPx(cctx, 10 + shift, 24, 7, 2, '#7f899c');
    outlineRect(cctx, 5, 1, 14, 7);
    outlineRect(cctx, 3, 8, 18, 10);
    walk.push(c);
  }
  return walk;
}

function buildExplosionFrames() {
  const frames = [];
  const colors = ['#ffeb91', '#ffd160', '#ff9f4f', '#e65e3a'];
  for (let i = 0; i < 6; i += 1) {
    const [c, cctx] = makeCanvas(26, 26);
    const radius = 3 + i * 2;
    for (let y = 0; y < 26; y += 1) {
      for (let x = 0; x < 26; x += 1) {
        const dx = x - 13;
        const dy = y - 13;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < radius) {
          const idx = Math.min(colors.length - 1, Math.floor((d / radius) * colors.length));
          drawPx(cctx, x, y, 1, 1, colors[idx]);
        }
      }
    }
    frames.push(c);
  }
  return frames;
}

const assets = {
  player: buildPlayerFrames(),
  clouds: buildCloudLayer(),
  buildings: buildBuildings(),
  trees: buildTrees(),
  ground: buildGroundTile(),
  muzzle: buildMuzzleFlashFrames(),
  enemyWalk: buildEnemyFrames(),
  explosion: buildExplosionFrames(),
};

const state = {
  camX: 0,
  bullets: [],
  particles: [],
  explosions: [],
  score: 0,
  over: false,
  won: false,
  enemyBullets: [],
  player: {
    x: 120,
    y: 200,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: false,
    crouch: false,
    shootCd: 0,
    hp: 5,
    shootFlash: 0,
  },
  enemies: [],
};

function spawnEnemies() {
  state.enemies = [];
  for (let i = 0; i < 32; i += 1) {
    state.enemies.push({
      x: 560 + i * 190,
      y: GROUND_Y - 26,
      w: 24,
      h: 26,
      dir: i % 2 ? -1 : 1,
      alive: true,
      shootCd: 0.9 + (i % 3) * 0.4,
      hp: 2,
      anim: 0,
    });
  }
}

function reset() {
  state.camX = 0;
  state.bullets = [];
  state.enemyBullets = [];
  state.particles = [];
  state.explosions = [];
  state.score = 0;
  state.over = false;
  state.won = false;
  state.player = {
    x: 120,
    y: 200,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: false,
    crouch: false,
    shootCd: 0,
    hp: 5,
    shootFlash: 0,
  };
  spawnEnemies();
}
spawnEnemies();

function shoot() {
  const p = state.player;
  if (p.shootCd > 0) return;
  p.shootCd = 0.17;
  p.shootFlash = 0.09;
  state.bullets.push({ x: p.x + (p.face > 0 ? 26 : 2), y: p.y + (p.crouch ? 23 : 14), vx: 640 * p.face });
}

function enemyShoot(e) {
  const p = state.player;
  const direction = p.x >= e.x ? 1 : -1;
  state.enemyBullets.push({ x: e.x + 10, y: e.y + 12, vx: direction * 240, vy: (p.y - e.y) * 0.06 });
}

function hitPlayer() {
  const p = state.player;
  p.hp -= 1;
  p.shootFlash = 0.15;
  if (p.hp <= 0) {
    state.over = true;
  }
}

let prev = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - prev) / 1000);
  prev = now;
  update(dt, now / 1000);
  render(now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function update(dt, t) {
  if (keys.has('r')) reset();
  if (state.over || state.won) return;

  const p = state.player;
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const down = keys.has('s') || keys.has('arrowdown');
  const jump = keys.has('w') || keys.has('arrowup') || keys.has(' ');
  const firing = keys.has('j') || keys.has('k');

  p.crouch = down && p.onGround;
  const speed = p.crouch ? 0 : 220;
  p.vx = 0;
  if (left) {
    p.vx = -speed;
    p.face = -1;
  }
  if (right) {
    p.vx = speed;
    p.face = 1;
  }
  if (jump && p.onGround && !p.crouch) {
    p.vy = -390;
    p.onGround = false;
  }
  if (firing) shoot();
  p.shootCd = Math.max(0, p.shootCd - dt);
  p.shootFlash = Math.max(0, p.shootFlash - dt);

  p.vy += 850 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  p.x = Math.max(0, Math.min(WORLD_LENGTH, p.x));
  if (p.y > GROUND_Y - 32) {
    p.y = GROUND_Y - 32;
    p.vy = 0;
    p.onGround = true;
  }

  state.camX = Math.max(0, Math.min(WORLD_LENGTH - W + 260, p.x - 220));

  state.bullets.forEach((b) => {
    b.x += b.vx * dt;
    if (Math.random() < 0.35) state.particles.push({ x: b.x, y: b.y, life: 0.2 + Math.random() * 0.12 });
  });
  state.bullets = state.bullets.filter((b) => b.x > state.camX - 60 && b.x < state.camX + W + 60);

  state.enemyBullets.forEach((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  });
  state.enemyBullets = state.enemyBullets.filter((b) => b.x > state.camX - 50 && b.x < state.camX + W + 50 && b.y > 0 && b.y < H);

  state.enemies.forEach((e) => {
    if (!e.alive) return;
    e.anim += dt;
    e.x += e.dir * 52 * dt;
    if (Math.abs(e.x - p.x) > 300) e.dir *= -1;

    e.shootCd -= dt;
    if (e.shootCd <= 0 && Math.abs(e.x - p.x) < 360) {
      enemyShoot(e);
      e.shootCd = 0.9 + ((e.x + t * 100) % 120) / 130;
    }

    if (Math.abs(e.x - p.x) < 20 && Math.abs(e.y - p.y) < 20) {
      hitPlayer();
    }

    for (const b of state.bullets) {
      if (b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h) {
        e.hp -= 1;
        b.x = -9999;
        if (e.hp <= 0) {
          e.alive = false;
          state.score += 150;
          state.explosions.push({ x: e.x + 10, y: e.y + 12, age: 0 });
        }
      }
    }
  });

  for (const b of state.enemyBullets) {
    if (Math.abs(b.x - (p.x + 12)) < 12 && Math.abs(b.y - (p.y + 14)) < 14) {
      b.x = -9999;
      hitPlayer();
    }
  }

  state.particles.forEach((pt) => {
    pt.life -= dt;
  });
  state.particles = state.particles.filter((pt) => pt.life > 0);

  state.explosions.forEach((e) => {
    e.age += dt;
  });
  state.explosions = state.explosions.filter((e) => e.age < 0.4);

  const aliveCount = state.enemies.filter((e) => e.alive).length;
  if (p.x >= WORLD_LENGTH - 110 || aliveCount === 0) {
    state.won = true;
  }
}

function render(t) {
  ctx.clearRect(0, 0, W, H);

  const cycle = (Math.sin(t * 0.08) + 1) * 0.5;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${35 + cycle * 30}, ${86 + cycle * 40}, ${150 + cycle * 60})`);
  g.addColorStop(1, `rgb(${90 + cycle * 40}, ${120 + cycle * 50}, ${170 + cycle * 60})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawSunMoon(cycle);
  drawParallax(assets.clouds, 0.12, 46 + Math.sin(t * 0.35) * 4);
  drawParallax(assets.buildings, 0.30, 128);
  drawParallax(assets.trees, 0.52, 226 + Math.sin(t * 0.55) * 1.5);

  for (let x = -64; x < W + 64; x += 64) {
    const gx = Math.floor(x + (state.camX % 64));
    ctx.drawImage(assets.ground, gx, GROUND_Y, 64, 64);
  }

  drawRoadAndProps(t);
  drawEnemies(t);
  drawProjectiles();
  drawPlayer(t);
  drawEffects(t);
  drawHUD();
  drawOverlay();
}

function drawSunMoon(cycle) {
  const x = 60 + cycle * (W - 120);
  const y = 90 - Math.sin(cycle * Math.PI) * 30;
  drawPx(ctx, x - 12, y - 12, 24, 24, cycle > 0.55 ? '#ffe07a' : '#d7e2ff');
}

function drawRoadAndProps(t) {
  const baseY = GROUND_Y - 12;
  for (let x = -80; x < W + 120; x += 80) {
    const wx = x + (state.camX % 80);
    drawPx(ctx, wx, baseY, 70, 12, '#333742');
    drawPx(ctx, wx + 14, baseY + 4, 18, 2, '#f0c96f');
  }

  // Street lamps
  for (let i = 0; i < 14; i += 1) {
    const worldX = 420 + i * 460;
    const sx = worldX - state.camX;
    if (sx < -20 || sx > W + 20) continue;
    drawPx(ctx, sx, GROUND_Y - 90, 3, 78, '#596171');
    drawPx(ctx, sx - 5, GROUND_Y - 94, 13, 5, '#7f899c');
    const glow = (Math.sin(t * 2 + i) + 1) * 0.5;
    drawPx(ctx, sx - 3, GROUND_Y - 100, 9, 4, `rgba(255,225,120,${0.35 + glow * 0.25})`);
  }
}

function drawEnemies(t) {
  state.enemies.forEach((e) => {
    if (!e.alive) return;
    const sx = e.x - state.camX;
    const frame = assets.enemyWalk[Math.floor((e.anim * 7) % assets.enemyWalk.length)];

    if (e.dir > 0) {
      ctx.drawImage(frame, sx, e.y);
    } else {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(frame, -sx - 24, e.y);
      ctx.restore();
    }

    if (Math.sin(t * 8 + e.x) > 0.82) {
      drawPx(ctx, sx + (e.dir > 0 ? 22 : -2), e.y + 11, 6, 2, '#ffdb79');
    }
  });
}

function drawProjectiles() {
  state.bullets.forEach((b) => {
    drawPx(ctx, b.x - state.camX, b.y, 7, 2, '#ffd674');
    drawPx(ctx, b.x - state.camX + 7, b.y, 2, 2, '#fff0b0');
  });

  state.enemyBullets.forEach((b) => {
    drawPx(ctx, b.x - state.camX, b.y, 5, 2, '#ff8e68');
  });
}

function drawPlayer(t) {
  const p = state.player;
  let img = assets.player.run[Math.floor((t * 10) % assets.player.run.length)];
  if (!p.onGround) img = assets.player.jump[0];
  if (p.crouch) img = assets.player.crouch[0];
  if (p.shootFlash > 0 && !p.crouch) img = assets.player.shoot[0];

  const px = Math.floor(p.x - state.camX);
  if (p.face > 0) {
    ctx.drawImage(img, px, p.y);
    if (p.shootFlash > 0) {
      const mf = assets.muzzle[Math.floor((1 - p.shootFlash / 0.09) * assets.muzzle.length) % assets.muzzle.length];
      ctx.drawImage(mf, px + 29, p.y + (p.crouch ? 20 : 12));
    }
  } else {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(img, -px - 32, p.y);
    if (p.shootFlash > 0) {
      const mf = assets.muzzle[Math.floor((1 - p.shootFlash / 0.09) * assets.muzzle.length) % assets.muzzle.length];
      ctx.drawImage(mf, px - 10, p.y + (p.crouch ? 20 : 12));
    }
    ctx.restore();
  }

  if (p.shootFlash > 0 && p.hp > 0) {
    drawPx(ctx, px + 2, p.y - 3, 28, 2, 'rgba(255,245,180,.35)');
  }
}

function drawEffects(t) {
  state.particles.forEach((pt) => {
    const alpha = Math.max(0, pt.life / 0.32);
    drawPx(ctx, pt.x - state.camX, pt.y, 1, 1, `rgba(255,220,120,${alpha})`);
  });

  state.explosions.forEach((e) => {
    const frame = Math.min(assets.explosion.length - 1, Math.floor((e.age / 0.4) * assets.explosion.length));
    ctx.drawImage(assets.explosion[frame], e.x - state.camX - 13, e.y - 13);
  });

  // ambient tiny cloud wisps
  for (let i = 0; i < 6; i += 1) {
    const x = ((t * 20 + i * 160) % (W + 60)) - 30;
    const y = 72 + i * 14;
    drawPx(ctx, x, y, 16, 2, 'rgba(255,255,255,.18)');
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(9,16,29,.88)';
  ctx.fillRect(14, 10, 280, 72);
  ctx.strokeStyle = '#f0c96f';
  ctx.strokeRect(14, 10, 280, 72);
  ctx.fillStyle = '#e5edf7';
  ctx.font = '16px monospace';
  ctx.fillText(`SCORE ${String(state.score).padStart(6, '0')}`, 26, 33);
  ctx.fillText(`POS ${Math.floor(state.player.x)}/${WORLD_LENGTH}`, 26, 54);
  ctx.fillText('HP', 26, 74);

  for (let i = 0; i < 5; i += 1) {
    drawPx(ctx, 66 + i * 20, 62, 14, 10, i < state.player.hp ? '#d95757' : '#4a5262');
    outlineRect(ctx, 66 + i * 20, 62, 14, 10, '#1c212f');
  }

  const alive = state.enemies.filter((e) => e.alive).length;
  ctx.fillStyle = '#f4d17e';
  ctx.fillText(`ENEMIES ${String(alive).padStart(2, '0')}`, 180, 74);
}

function drawOverlay() {
  if (!(state.over || state.won)) return;

  ctx.fillStyle = 'rgba(2,8,17,.76)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = state.won ? '#9cf4b2' : '#f4d17e';
  ctx.font = '38px monospace';
  ctx.fillText(state.won ? 'MISSION COMPLETE' : 'MISSION FAILED', W / 2 - 190, H / 2 - 16);

  ctx.font = '18px monospace';
  ctx.fillStyle = '#e6edf8';
  ctx.fillText('Press R to restart', W / 2 - 88, H / 2 + 18);
}

function drawParallax(image, factor, y) {
  const ox = -((state.camX * factor) % image.width);
  for (let x = ox - image.width; x < W + image.width; x += image.width) {
    ctx.drawImage(image, x, y);
  }
}
