export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly DEFAULT_LIVES = 3;
  private static readonly RUN_SPEED = 220;
  private static readonly JUMP_VELOCITY = 400;
  private static readonly MUZZLE_OFFSET_X = 18;
  private static readonly MUZZLE_OFFSET_Y = -4;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly shootKey: Phaser.Input.Keyboard.Key;

  private lives = Player.DEFAULT_LIVES;
  private facingDirection: -1 | 1 = 1;
  private shootTriggered = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.shootKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
  }

  update(): void {
    this.shootTriggered = Phaser.Input.Keyboard.JustDown(this.shootKey);

    if (!this.isAlive()) {
      this.setVelocityX(0);
      this.playIdleAnimation();
      return;
    }

    if (this.cursors.left.isDown) {
      this.setVelocityX(-Player.RUN_SPEED);
      this.facingDirection = -1;
      this.setFlipX(true);
      this.playRunAnimation();
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(Player.RUN_SPEED);
      this.facingDirection = 1;
      this.setFlipX(false);
      this.playRunAnimation();
    } else {
      this.setVelocityX(0);
      if (this.isGrounded()) {
        this.playIdleAnimation();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.isGrounded()) {
      this.setVelocityY(-Player.JUMP_VELOCITY);
      this.playJumpAnimation();
    } else if (!this.isGrounded()) {
      this.playJumpAnimation();
    }
  }

  takeDamage(amount = 1): void {
    this.lives = Math.max(0, this.lives - amount);
  }

  isAlive(): boolean {
    return this.lives > 0;
  }

  getLives(): number {
    return this.lives;
  }

  consumeShootTrigger(): boolean {
    const wasTriggered = this.shootTriggered;
    this.shootTriggered = false;
    return wasTriggered;
  }

  getFacingDirection(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.facingDirection, 0);
  }

  getMuzzlePosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      this.x + this.facingDirection * Player.MUZZLE_OFFSET_X,
      this.y + Player.MUZZLE_OFFSET_Y,
    );
  }

  private isGrounded(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return false;
    }

    return body.blocked.down || body.touching.down;
  }

  private playIdleAnimation(): void {
    this.playAnimationIfExists('player-idle');
  }

  private playRunAnimation(): void {
    this.playAnimationIfExists('player-run');
  }

  private playJumpAnimation(): void {
    this.playAnimationIfExists('player-jump');
  }

  private playAnimationIfExists(key: string): void {
    if (!this.anims || !this.scene.anims.exists(key)) {
      return;
    }

    if (this.anims.currentAnim?.key !== key) {
      this.anims.play(key, true);
    }
  }
}
