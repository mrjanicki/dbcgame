export interface HUDState {
  lives: number;
  score: number;
  kills: number;
  debugText?: string;
}

export interface HUDOptions {
  x?: number;
  y?: number;
  lineHeight?: number;
  font?: string;
  color?: string;
  shadowColor?: string;
  showDebug?: boolean;
}

/**
 * Lightweight HUD renderer for prototype gameplay overlays.
 *
 * Draws:
 * - Player lives
 * - Score and kill count
 * - Optional debug line (toggleable)
 */
export class HUD {
  private x: number;
  private y: number;
  private lineHeight: number;
  private font: string;
  private color: string;
  private shadowColor: string;
  private showDebug: boolean;

  constructor(options: HUDOptions = {}) {
    this.x = options.x ?? 16;
    this.y = options.y ?? 24;
    this.lineHeight = options.lineHeight ?? 24;
    this.font = options.font ?? 'bold 18px monospace';
    this.color = options.color ?? '#ffffff';
    this.shadowColor = options.shadowColor ?? 'rgba(0, 0, 0, 0.7)';
    this.showDebug = options.showDebug ?? false;
  }

  public setDebugEnabled(enabled: boolean): void {
    this.showDebug = enabled;
  }

  public render(ctx: CanvasRenderingContext2D, state: HUDState): void {
    const lines: string[] = [
      `Lives: ${Math.max(0, state.lives)}`,
      `Score: ${Math.max(0, state.score)}  Kills: ${Math.max(0, state.kills)}`,
    ];

    if (this.showDebug && state.debugText?.trim()) {
      lines.push(`Debug: ${state.debugText}`);
    }

    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    lines.forEach((line, index) => {
      const yy = this.y + index * this.lineHeight;

      // simple shadow to keep text readable over bright backgrounds
      ctx.fillStyle = this.shadowColor;
      ctx.fillText(line, this.x + 1, yy + 1);
      ctx.fillStyle = this.color;
      ctx.fillText(line, this.x, yy);
    });

    ctx.restore();
  }
}
