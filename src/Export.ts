import { PixelCanvas } from './Canvas.js';
import { Color, colorToCSS, CanvasSize } from './types.js';

export class Export {
  private canvas: PixelCanvas;

  constructor(canvas: PixelCanvas) {
    this.canvas = canvas;
  }

  toPNG(scale: number = 1): string {
    const size = this.canvas.size;
    const offscreen = document.createElement('canvas');
    offscreen.width = size.width * scale;
    offscreen.height = size.height * scale;
    const ctx = offscreen.getContext('2d')!;

    const data = this.canvas.getGridData();
    for (const [key, color] of data) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = colorToCSS(color);
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }

    return offscreen.toDataURL('image/png');
  }

  downloadPNG(filename: string = 'pixel-art.png', scale: number = 8): void {
    const dataUrl = this.toPNG(scale);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  toJSON(): string {
    const size = this.canvas.size;
    const pixels: { x: number; y: number; color: Color }[] = [];
    const data = this.canvas.getGridData();
    for (const [key, color] of data) {
      const [x, y] = key.split(',').map(Number);
      pixels.push({ x, y, color });
    }
    return JSON.stringify({ version: 1, size, pixels }, null, 2);
  }

  downloadJSON(filename: string = 'pixel-art.json'): void {
    const json = this.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  loadJSON(json: string): void {
    const project = JSON.parse(json);
    if (project.version !== 1) throw new Error('Unsupported project version');
    this.canvas.resize(project.size.width, project.size.height);
    this.canvas.clear();
    for (const pixel of project.pixels) {
      this.canvas.drawPixel(pixel.x, pixel.y, pixel.color);
    }
  }

  async copyToClipboard(scale: number = 4): Promise<void> {
    const size = this.canvas.size;
    const offscreen = document.createElement('canvas');
    offscreen.width = size.width * scale;
    offscreen.height = size.height * scale;
    const ctx = offscreen.getContext('2d')!;

    const data = this.canvas.getGridData();
    for (const [key, color] of data) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = colorToCSS(color);
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }

    offscreen.toBlob(async (blob) => {
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    }, 'image/png');
  }
}
