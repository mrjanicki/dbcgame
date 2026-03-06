import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class WeaponSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player
  ) {}

  update(_time: number, _delta: number): void {
    void this.scene;
    void this.player;
    // Placeholder for fire logic.
  }
}
