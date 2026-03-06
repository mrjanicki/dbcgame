import Phaser from 'phaser';

export class Player {
  private readonly sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 28, 28, 0x4ff3ff);
  }

  update(_time: number, _delta: number): void {
    // Placeholder for movement logic.
  }
}
