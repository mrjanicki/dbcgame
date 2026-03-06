import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { WeaponSystem } from '../systems/WeaponSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private enemySpawner?: EnemySpawner;
  private weaponSystem?: WeaponSystem;
  private collisionSystem?: CollisionSystem;
  private hud?: HUD;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.player = new Player(this, 640, 360);
    this.enemySpawner = new EnemySpawner(this);
    this.weaponSystem = new WeaponSystem(this, this.player);
    this.collisionSystem = new CollisionSystem(this);
    this.hud = new HUD(this);
  }

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.enemySpawner?.update(time, delta);
    this.weaponSystem?.update(time, delta);
    this.collisionSystem?.update(time, delta);
    this.hud?.update(time, delta);
  }
}
