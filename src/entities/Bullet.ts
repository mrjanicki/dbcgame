import Phaser from 'phaser';

export class Bullet {
  private readonly sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 10, 4, 0xffe680);
  }

  update(_time: number, _delta: number): void {
    // Placeholder for bullet movement.
  }
}
