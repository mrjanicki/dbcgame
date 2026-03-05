import Phaser from 'phaser';

export type SoldierState = 'idle' | 'walk' | 'shoot' | 'dead';

export interface SoldierEnemyConfig {
  health: number;
  speed: number;
  fireCooldown: number;
  detectionRange: number;
  shotIntervalVariance?: number;
  scoreValue?: number;
  onShoot?: (enemy: SoldierEnemy, target: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => void;
  onDeath?: (enemy: SoldierEnemy) => void;
  onScore?: (value: number, enemy: SoldierEnemy) => void;
}

const DEFAULT_SHOT_VARIANCE_FACTOR = 0.35;

/**
 * Basic soldier enemy driven by a finite state machine.
 */
export class SoldierEnemy extends Phaser.Physics.Arcade.Sprite {
  public state: SoldierState = 'idle';

  private health: number;
  private readonly speed: number;
  private readonly fireCooldown: number;
  private readonly detectionRange: number;
  private readonly shotIntervalVariance: number;
  private readonly scoreValue: number;

  private readonly target: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private readonly onShoot?: SoldierEnemyConfig['onShoot'];
  private readonly onDeath?: SoldierEnemyConfig['onDeath'];
  private readonly onScore?: SoldierEnemyConfig['onScore'];

  private nextShotAt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    target: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    config: SoldierEnemyConfig,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this.target = target;
    this.health = config.health;
    this.speed = config.speed;
    this.fireCooldown = config.fireCooldown;
    this.detectionRange = config.detectionRange;
    this.shotIntervalVariance =
      config.shotIntervalVariance ?? this.fireCooldown * DEFAULT_SHOT_VARIANCE_FACTOR;
    this.scoreValue = config.scoreValue ?? 0;

    this.onShoot = config.onShoot;
    this.onDeath = config.onDeath;
    this.onScore = config.onScore;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(true);
    this.setVisible(true);
    this.scheduleNextShot(0);
  }

  public update(time: number): void {
    if (this.state === 'dead') {
      return;
    }

    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y,
    );

    if (distanceToTarget > this.detectionRange) {
      this.transitionTo('idle');
      this.setVelocity(0, 0);
      return;
    }

    if (time >= this.nextShotAt) {
      this.transitionTo('shoot');
      this.setVelocity(0, 0);
      this.shoot();
      this.scheduleNextShot(time);
      return;
    }

    this.transitionTo('walk');
    this.scene.physics.moveToObject(this, this.target, this.speed);
  }

  public takeDamage(amount: number): void {
    if (this.state === 'dead') {
      return;
    }

    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    }
  }

  public die(): void {
    if (this.state === 'dead') {
      return;
    }

    this.transitionTo('dead');
    this.setVelocity(0, 0);

    if (this.body) {
      this.disableBody(true, true);
    } else {
      this.setActive(false);
      this.setVisible(false);
    }

    if (this.scoreValue > 0) {
      this.onScore?.(this.scoreValue, this);
    }

    this.onDeath?.(this);
  }

  private shoot(): void {
    this.onShoot?.(this, this.target);
  }

  private scheduleNextShot(fromTime: number): void {
    const jitter = Phaser.Math.FloatBetween(
      -this.shotIntervalVariance,
      this.shotIntervalVariance,
    );

    this.nextShotAt = fromTime + Math.max(0, this.fireCooldown + jitter);
  }

  private transitionTo(newState: SoldierState): void {
    this.state = newState;
  }
}
