import Phaser from 'phaser';

export class HUD {
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.label = scene.add.text(16, 16, 'HUD', { color: '#ffffff', fontSize: '18px' });
  }

  update(_time: number, _delta: number): void {
    this.label.setText('HUD');
  }
}
