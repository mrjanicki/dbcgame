import Phaser from 'phaser';

export interface CollisionSystemConfig {
  scene: Phaser.Scene;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  enemies: Phaser.Physics.Arcade.Group;
  playerBullets: Phaser.Physics.Arcade.Group;
  enemyBullets: Phaser.Physics.Arcade.Group;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  playerInvulnerabilityMs?: number;
  enemyHitCooldownMs?: number;
}

/**
 * Registers all gameplay collision/overlap handlers for the scene.
 */
export class CollisionSystem {
  private readonly scene: Phaser.Scene;
  private readonly player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private readonly enemies: Phaser.Physics.Arcade.Group;
  private readonly playerBullets: Phaser.Physics.Arcade.Group;
  private readonly enemyBullets: Phaser.Physics.Arcade.Group;
  private readonly collisionLayer: Phaser.Tilemaps.TilemapLayer;
  private readonly playerInvulnerabilityMs: number;
  private readonly enemyHitCooldownMs: number;

  private playerInvulnerableUntil = 0;

  constructor(config: CollisionSystemConfig) {
    this.scene = config.scene;
    this.player = config.player;
    this.enemies = config.enemies;
    this.playerBullets = config.playerBullets;
    this.enemyBullets = config.enemyBullets;
    this.collisionLayer = config.collisionLayer;
    this.playerInvulnerabilityMs = config.playerInvulnerabilityMs ?? 500;
    this.enemyHitCooldownMs = config.enemyHitCooldownMs ?? 50;
  }

  register(): void {
    const { physics } = this.scene;

    // player bullet -> enemy damage
    physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.handlePlayerBulletHitsEnemy,
      undefined,
      this,
    );

    // enemy bullet -> player damage (with invulnerability window)
    physics.add.overlap(
      this.enemyBullets,
      this.player,
      this.handleEnemyBulletHitsPlayer,
      undefined,
      this,
    );

    // bullets vs collision layer
    physics.add.collider(this.playerBullets, this.collisionLayer, this.destroyBulletOnWorldCollision, undefined, this);
    physics.add.collider(this.enemyBullets, this.collisionLayer, this.destroyBulletOnWorldCollision, undefined, this);

    // entities vs collision layer
    physics.add.collider(this.player, this.collisionLayer);
    physics.add.collider(this.enemies, this.collisionLayer);
  }

  private handlePlayerBulletHitsEnemy(
    bulletObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject,
  ): void {
    const bullet = bulletObject as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const enemy = enemyObject as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    this.safeDestroy(bullet);

    const now = this.scene.time.now;
    const enemyInvulnerableUntil = Number(enemy.getData('invulnerableUntil') ?? 0);
    if (now < enemyInvulnerableUntil) {
      return;
    }

    enemy.setData('invulnerableUntil', now + this.enemyHitCooldownMs);

    const nextHealth = Number(enemy.getData('health') ?? 1) - 1;
    enemy.setData('health', nextHealth);

    if (nextHealth <= 0) {
      enemy.emit('enemy-destroyed', enemy);
      this.scene.events.emit('enemy-destroyed', enemy);
      this.safeDestroy(enemy);
    }
  }

  private handleEnemyBulletHitsPlayer(
    bulletObject: Phaser.GameObjects.GameObject,
    playerObject: Phaser.GameObjects.GameObject,
  ): void {
    const bullet = bulletObject as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const player = playerObject as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    this.safeDestroy(bullet);

    const now = this.scene.time.now;
    if (now < this.playerInvulnerableUntil) {
      return;
    }

    this.playerInvulnerableUntil = now + this.playerInvulnerabilityMs;

    const nextHealth = Number(player.getData('health') ?? 1) - 1;
    player.setData('health', nextHealth);

    player.emit('player-hit', { health: nextHealth, invulnerableUntil: this.playerInvulnerableUntil });
    this.scene.events.emit('player-hit', { health: nextHealth, invulnerableUntil: this.playerInvulnerableUntil });

    if (nextHealth <= 0) {
      player.emit('player-destroyed', player);
      this.scene.events.emit('player-destroyed', player);
      this.safeDestroy(player);
    }
  }

  private destroyBulletOnWorldCollision(bulletObject: Phaser.GameObjects.GameObject): void {
    this.safeDestroy(bulletObject as Phaser.Types.Physics.Arcade.GameObjectWithBody);
  }

  private safeDestroy(target: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    if (!target || !target.active) {
      return;
    }

    target.disableBody?.(true, true);
    target.destroy();
  }
}
