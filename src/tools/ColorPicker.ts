import { PixelCanvas } from '../Canvas.js';
import { Color, TRANSPARENT } from '../types.js';

export type ColorPickCallback = (color: Color) => void;

export class ColorPickerTool {
  private callback: ColorPickCallback | null = null;

  onColorPicked(cb: ColorPickCallback): void {
    this.callback = cb;
  }

  onMouseDown(canvas: PixelCanvas, x: number, y: number): void {
    const size = canvas.size;
    if (x < 0 || x >= size.width || y < 0 || y >= size.height) return;

    const color = canvas.getPixel(x, y);
    if (this.callback) {
      this.callback(color.a === 0 ? TRANSPARENT : color);
    }
  }
}
