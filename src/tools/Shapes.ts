import { PixelCanvas } from '../Canvas.js';
import { Color } from '../types.js';

export type ShapeType = 'line' | 'rect';

export class ShapesTool {
  private drawing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private previewPixels: { x: number; y: number }[] = [];
  private snapshotData: Map<string, Color> | null = null;
  public shapeType: ShapeType = 'line';

  onMouseDown(canvas: PixelCanvas, x: number, y: number): void {
    this.drawing = true;
    this.startX = x;
    this.startY = y;
    this.snapshotData = canvas.getGridData();
  }

  onMouseMove(canvas: PixelCanvas, x: number, y: number, color: Color): void {
    if (!this.drawing || !this.snapshotData) return;

    // Restore snapshot before drawing preview
    canvas.setGridData(this.snapshotData);

    const pixels = this.shapeType === 'line'
      ? this.linePixels(this.startX, this.startY, x, y)
      : this.rectPixels(this.startX, this.startY, x, y);

    this.previewPixels = pixels;
    for (const p of pixels) {
      canvas.drawPixel(p.x, p.y, color);
    }
  }

  onMouseUp(canvas: PixelCanvas, x: number, y: number, color: Color): void {
    if (!this.drawing) return;

    if (this.snapshotData) {
      canvas.setGridData(this.snapshotData);
    }

    const pixels = this.shapeType === 'line'
      ? this.linePixels(this.startX, this.startY, x, y)
      : this.rectPixels(this.startX, this.startY, x, y);

    for (const p of pixels) {
      canvas.drawPixel(p.x, p.y, color);
    }

    this.drawing = false;
    this.snapshotData = null;
    this.previewPixels = [];
  }

  private linePixels(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
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

  private rectPixels(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);
    for (let x = minX; x <= maxX; x++) {
      points.push({ x, y: minY });
      points.push({ x, y: maxY });
    }
    for (let y = minY + 1; y < maxY; y++) {
      points.push({ x: minX, y });
      points.push({ x: maxX, y });
    }
    return points;
  }
}
