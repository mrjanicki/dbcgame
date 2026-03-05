import Phaser from 'phaser';
import { CollisionSystem } from '../systems/CollisionSystem';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;

  create(): void {
    // Placeholder setup hooks. In the real scene these are expected to be created by factories/spawners.
    this.player = this.physics.add.sprite(0, 0, 'player');
    this.player.setData('health', this.player.getData('health') ?? 3);

    this.enemies = this.physics.add.group();
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tiles');
    this.collisionLayer = map.createLayer('collision', tileset as Phaser.Tilemaps.Tileset, 0, 0);
    this.collisionLayer.setCollisionByProperty({ collides: true });

    const collisionSystem = new CollisionSystem({
      scene: this,
      player: this.player,
      enemies: this.enemies,
      playerBullets: this.playerBullets,
      enemyBullets: this.enemyBullets,
      collisionLayer: this.collisionLayer,
      playerInvulnerabilityMs: 800,
      enemyHitCooldownMs: 100,
    });

    collisionSystem.register();
  }
}
