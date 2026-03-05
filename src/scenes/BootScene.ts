import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0f1a');
    this.registry.set('gameVersion', '0.1.0');
    this.scene.start('preload');
  }
}
