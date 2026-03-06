import Phaser from 'phaser';

export class CollisionSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  update(_time: number, _delta: number): void {
    void this.scene;
    // Placeholder for overlap/collision checks.
  }
}
