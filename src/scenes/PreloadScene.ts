import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.setPath('/');
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
