import Phaser from 'phaser';

type Spawn = { x: number; y: number; speed: number };
type Platform = { x: number; y: number; width: number; height: number };

type LevelData = {
  world: { width: number; height: number };
  platforms: Platform[];
  enemySpawns: Spawn[];
  playerSpawn: { x: number; y: number };
};

export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private player!: Phaser.Physics.Arcade.Sprite;

  private enemies!: Phaser.Physics.Arcade.Group;

  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  private uiText!: Phaser.GameObjects.Text;

  private jumpKey!: Phaser.Input.Keyboard.Key;

  private leftKey!: Phaser.Input.Keyboard.Key;

  private rightKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('game');
  }

  create(): void {
    const level = this.cache.json.get('level-data') as LevelData;
    const worldWidth = level?.world?.width ?? 1600;
    const worldHeight = level?.world?.height ?? 320;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x0f172a).setDepth(-2);

    this.platforms = this.physics.add.staticGroup();
    for (const platform of level.platforms) {
      const block = this.platforms
        .create(platform.x, platform.y, 'platform')
        .setDisplaySize(platform.width, platform.height)
        .setOrigin(0.5, 0.5)
        .refreshBody();
      block.setTint(0x6e7681);
    }

    this.player = this.physics.add.sprite(level.playerSpawn.x, level.playerSpawn.y, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);

    this.enemies = this.physics.add.group();
    for (const spawn of level.enemySpawns) {
      const enemy = this.enemies.create(spawn.x, spawn.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(spawn.speed);
      enemy.setBounce(1, 0);
      enemy.setData('patrolSpeed', spawn.speed);
    }

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, () => {
      this.scene.restart();
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.uiText = this.add
      .text(6, 6, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(2);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update(): void {
    const leftDown = this.cursors.left.isDown || this.leftKey.isDown;
    const rightDown = this.cursors.right.isDown || this.rightKey.isDown;

    if (leftDown) {
      this.player.setVelocityX(-120);
    } else if (rightDown) {
      this.player.setVelocityX(120);
    } else {
      this.player.setVelocityX(0);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.jumpKey);
    if (jumpPressed && this.player.body.blocked.down) {
      this.player.setVelocityY(-220);
    }

    this.enemies.getChildren().forEach((enemyObj) => {
      const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
      const patrolSpeed = enemy.getData('patrolSpeed') as number;

      if (enemy.body.blocked.right) {
        enemy.setVelocityX(-Math.abs(patrolSpeed));
      } else if (enemy.body.blocked.left) {
        enemy.setVelocityX(Math.abs(patrolSpeed));
      }
    });

    this.uiText.setText([`HP: 01`, `X: ${Math.round(this.player.x)}`, `Enemies: ${this.enemies.countActive(true)}`]);
  }
}
