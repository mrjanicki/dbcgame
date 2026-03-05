export type BulletOwner = 'player' | 'enemy';

interface FireConfig {
  x: number;
  y: number;
  owner: BulletOwner;
  speed: number;
  directionX: number;
  directionY: number;
  lifespanMs?: number;
}

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  public owner: BulletOwner = 'player';

  private lifespanMs = 1000;
  private birthTimeMs = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  fire(config: FireConfig): void {
    const { x, y, owner, speed, directionX, directionY, lifespanMs } = config;

    const length = Math.hypot(directionX, directionY) || 1;
    const normalizedX = directionX / length;
    const normalizedY = directionY / length;

    this.owner = owner;
    this.lifespanMs = lifespanMs ?? 1000;
    this.birthTimeMs = this.scene.time.now;

    this.enableBody(true, x, y, true, true);
    this.setPosition(x, y);
    this.setVelocity(normalizedX * speed, normalizedY * speed);

    const angleDeg = Phaser.Math.RadToDeg(Math.atan2(normalizedY, normalizedX));
    this.setAngle(angleDeg);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active) {
      return;
    }

    if (time - this.birthTimeMs >= this.lifespanMs) {
      this.destroyToPool();
      return;
    }

    const worldBounds = this.scene.physics.world.bounds;
    if (!Phaser.Geom.Rectangle.Overlaps(worldBounds, this.getBounds())) {
      this.destroyToPool();
    }
  }

  destroyToPool(): void {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
