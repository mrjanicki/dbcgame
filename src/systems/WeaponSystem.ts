import Bullet from '../entities/Bullet';

type ShooterLike = Phaser.Types.Physics.Arcade.GameObjectWithBody & {
  x: number;
  y: number;
};

export interface WeaponConfig {
  bulletTextureKey?: string;
  playerBulletSpeed?: number;
  enemyBulletSpeed?: number;
  playerFireRateMs?: number;
  enemyFireRateMs?: number;
  bulletLifespanMs?: number;
  poolSize?: number;
}

export default class WeaponSystem {
  private readonly scene: Phaser.Scene;

  private readonly playerBullets: Phaser.Physics.Arcade.Group;
  private readonly enemyBullets: Phaser.Physics.Arcade.Group;

  private readonly bulletTextureKey: string;
  private readonly playerBulletSpeed: number;
  private readonly enemyBulletSpeed: number;
  private readonly playerFireRateMs: number;
  private readonly enemyFireRateMs: number;
  private readonly bulletLifespanMs: number;

  private lastPlayerShotAt = 0;
  private lastEnemyShotAt = 0;

  constructor(scene: Phaser.Scene, config: WeaponConfig = {}) {
    this.scene = scene;

    this.bulletTextureKey = config.bulletTextureKey ?? 'bullet';
    this.playerBulletSpeed = config.playerBulletSpeed ?? 650;
    this.enemyBulletSpeed = config.enemyBulletSpeed ?? 350;
    this.playerFireRateMs = config.playerFireRateMs ?? 150;
    this.enemyFireRateMs = config.enemyFireRateMs ?? 500;
    this.bulletLifespanMs = config.bulletLifespanMs ?? 1200;

    this.ensureBulletTexture(this.bulletTextureKey);

    const poolSize = config.poolSize ?? 100;

    this.playerBullets = this.scene.physics.add.group({
      classType: Bullet,
      maxSize: poolSize,
      runChildUpdate: true,
      defaultKey: this.bulletTextureKey,
    });

    this.enemyBullets = this.scene.physics.add.group({
      classType: Bullet,
      maxSize: poolSize,
      runChildUpdate: true,
      defaultKey: this.bulletTextureKey,
    });
  }

  firePlayerBullet(player: ShooterLike): Bullet | null {
    const now = this.scene.time.now;
    if (now - this.lastPlayerShotAt < this.playerFireRateMs) {
      return null;
    }

    const bullet = this.playerBullets.get(player.x, player.y, this.bulletTextureKey) as Bullet | null;
    if (!bullet) {
      return null;
    }

    this.lastPlayerShotAt = now;
    bullet.fire({
      x: player.x,
      y: player.y,
      owner: 'player',
      speed: this.playerBulletSpeed,
      directionX: 1,
      directionY: 0,
      lifespanMs: this.bulletLifespanMs,
    });

    return bullet;
  }

  fireEnemyBullet(enemy: ShooterLike, targetX: number, targetY: number): Bullet | null {
    const now = this.scene.time.now;
    if (now - this.lastEnemyShotAt < this.enemyFireRateMs) {
      return null;
    }

    const bullet = this.enemyBullets.get(enemy.x, enemy.y, this.bulletTextureKey) as Bullet | null;
    if (!bullet) {
      return null;
    }

    this.lastEnemyShotAt = now;
    bullet.fire({
      x: enemy.x,
      y: enemy.y,
      owner: 'enemy',
      speed: this.enemyBulletSpeed,
      directionX: targetX - enemy.x,
      directionY: targetY - enemy.y,
      lifespanMs: this.bulletLifespanMs,
    });

    return bullet;
  }

  getPlayerBullets(): Phaser.Physics.Arcade.Group {
    return this.playerBullets;
  }

  getEnemyBullets(): Phaser.Physics.Arcade.Group {
    return this.enemyBullets;
  }

  private ensureBulletTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      return;
    }

    const size = 8;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, size, size / 2);
    graphics.generateTexture(textureKey, size, size / 2);
    graphics.destroy();
  }
}
