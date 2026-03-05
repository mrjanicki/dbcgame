import Phaser from 'phaser';

export class Enemy {
  private readonly sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 26, 26, 0xff6464);
  }

  update(_time: number, _delta: number): void {
    // Placeholder for enemy behavior.
  }
}
