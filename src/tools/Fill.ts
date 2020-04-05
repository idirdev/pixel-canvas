import { PixelCanvas } from '../Canvas.js';
import { Color, colorsEqual, pixelKey, TRANSPARENT } from '../types.js';

export class FillTool {
  private tolerance: number = 0;

  setTolerance(value: number): void {
    this.tolerance = Math.max(0, Math.min(255, value));
  }

  onMouseDown(canvas: PixelCanvas, x: number, y: number, fillColor: Color): void {
    const size = canvas.size;
    if (x < 0 || x >= size.width || y < 0 || y >= size.height) return;

    const targetColor = canvas.getPixel(x, y);

    // Don't fill if clicking on the same color
    if (colorsEqual(targetColor, fillColor)) return;

    const visited = new Set<string>();
    const queue: { x: number; y: number }[] = [{ x, y }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = pixelKey(current.x, current.y);

      if (visited.has(key)) continue;
      if (current.x < 0 || current.x >= size.width) continue;
      if (current.y < 0 || current.y >= size.height) continue;

      const currentColor = canvas.getPixel(current.x, current.y);

      if (!this.withinTolerance(currentColor, targetColor)) continue;

      visited.add(key);
      canvas.drawPixel(current.x, current.y, fillColor);

      // Enqueue 4-connected neighbors
      queue.push({ x: current.x + 1, y: current.y });
      queue.push({ x: current.x - 1, y: current.y });
      queue.push({ x: current.x, y: current.y + 1 });
      queue.push({ x: current.x, y: current.y - 1 });
    }
  }

  private withinTolerance(a: Color, b: Color): boolean {
    if (this.tolerance === 0) return colorsEqual(a, b);
    const dr = Math.abs(a.r - b.r);
    const dg = Math.abs(a.g - b.g);
    const db = Math.abs(a.b - b.b);
    const da = Math.abs(a.a - b.a);
    return dr <= this.tolerance && dg <= this.tolerance &&
           db <= this.tolerance && da <= this.tolerance;
  }
}
