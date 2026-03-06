import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    const centerX = this.scale.width * 0.5;
    const centerY = this.scale.height * 0.5;

    this.add
      .text(centerX, centerY - 26, 'Contra: Poland 1995', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 10, 'Move: Arrow Keys / WASD\nJump: Space\nPress any key to start', {
        fontFamily: 'monospace',
        align: 'center',
        fontSize: '10px',
        color: '#c9d1d9',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown', () => {
      this.scene.start('game');
    });
  }
}
