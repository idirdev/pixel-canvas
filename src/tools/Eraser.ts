import { PixelCanvas } from '../Canvas.js';

export class EraserTool {
  private erasing: boolean = false;
  private lastX: number = -1;
  private lastY: number = -1;

  onMouseDown(canvas: PixelCanvas, x: number, y: number): void {
    this.erasing = true;
    this.lastX = x;
    this.lastY = y;
    canvas.erasePixel(x, y);
  }

  onMouseMove(canvas: PixelCanvas, x: number, y: number): void {
    if (!this.erasing) return;
    const points = this.interpolate(this.lastX, this.lastY, x, y);
    for (const p of points) {
      canvas.erasePixel(p.x, p.y);
    }
    this.lastX = x;
    this.lastY = y;
  }

  onMouseUp(): void {
    this.erasing = false;
    this.lastX = -1;
    this.lastY = -1;
  }

  private interpolate(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    let dx = Math.abs(x1 - x0);
    let dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      points.push({ x: x0, y: y0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return points;
  }
}
