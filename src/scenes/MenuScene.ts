import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.add.text(64, 64, 'dbcgame', { color: '#ffffff', fontSize: '42px' });
    this.add.text(64, 128, 'Click to start', { color: '#9ad6ff', fontSize: '28px' });

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
