import Phaser from 'phaser';

const createSpriteDataUrl = (fill: string, stroke = '#000000'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 16, 16);
  ctx.strokeStyle = stroke;
  ctx.strokeRect(0.5, 0.5, 15, 15);

  return canvas.toDataURL('image/png');
};

const levelData = {
  world: { width: 1600, height: 320 },
  platforms: [
    { x: 800, y: 306, width: 1600, height: 28 },
    { x: 300, y: 250, width: 180, height: 16 },
    { x: 620, y: 220, width: 220, height: 16 },
    { x: 970, y: 190, width: 160, height: 16 },
    { x: 1260, y: 240, width: 220, height: 16 },
  ],
  enemySpawns: [
    { x: 460, y: 190, speed: 55 },
    { x: 840, y: 150, speed: 70 },
    { x: 1320, y: 190, speed: 65 },
  ],
  playerSpawn: { x: 80, y: 230 },
};

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload(): void {
    this.load.image('player', createSpriteDataUrl('#3fb950'));
    this.load.image('enemy', createSpriteDataUrl('#f85149'));
    this.load.image('platform', createSpriteDataUrl('#8b949e'));
    this.load.image('bullet', createSpriteDataUrl('#f2cc60'));
    this.load.json('level-data', `data:application/json,${encodeURIComponent(JSON.stringify(levelData))}`);

    this.add.text(12, 12, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    });
  }

  create(): void {
    if (!this.textures.exists('player')) {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0x3fb950, 1);
      gfx.fillRect(0, 0, 16, 16);
      gfx.generateTexture('player', 16, 16);
      gfx.destroy();
    }

    this.scene.start('menu');
  }
}
