import { PixelCanvas } from '../Canvas.js';
import { Color } from '../types.js';

export class PencilTool {
  private drawing: boolean = false;
  private lastX: number = -1;
  private lastY: number = -1;

  onMouseDown(canvas: PixelCanvas, x: number, y: number, color: Color): void {
    this.drawing = true;
    this.lastX = x;
    this.lastY = y;
    canvas.drawPixel(x, y, color);
  }

  onMouseMove(canvas: PixelCanvas, x: number, y: number, color: Color): void {
    if (!this.drawing) return;
    // Bresenham's line algorithm for smooth strokes between points
    const points = this.bresenhamLine(this.lastX, this.lastY, x, y);
    for (const p of points) {
      canvas.drawPixel(p.x, p.y, color);
    }
    this.lastX = x;
    this.lastY = y;
  }

  onMouseUp(): void {
    this.drawing = false;
    this.lastX = -1;
    this.lastY = -1;
  }

  private bresenhamLine(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
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
