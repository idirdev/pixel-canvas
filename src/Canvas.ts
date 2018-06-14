import { Color, CanvasSize, pixelKey, colorToCSS, TRANSPARENT } from './types.js';

export class PixelCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Map<string, Color> = new Map();
  private _size: CanvasSize;
  private _zoom: number = 16;
  private _panX: number = 0;
  private _panY: number = 0;
  private _showGrid: boolean = true;
  private _cursorX: number = -1;
  private _cursorY: number = -1;

  constructor(container: HTMLElement, width: number = 32, height: number = 32) {
    this._size = { width, height };
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('pixel-canvas');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvasElement();
  }

  get element(): HTMLCanvasElement { return this.canvas; }
  get size(): CanvasSize { return { ...this._size }; }
  get zoom(): number { return this._zoom; }

  private resizeCanvasElement(): void {
    this.canvas.width = this._size.width * this._zoom;
    this.canvas.height = this._size.height * this._zoom;
    this.render();
  }

  drawPixel(x: number, y: number, color: Color): void {
    if (x < 0 || x >= this._size.width || y < 0 || y >= this._size.height) return;
    this.grid.set(pixelKey(x, y), { ...color });
    this.render();
  }

  erasePixel(x: number, y: number): void {
    const key = pixelKey(x, y);
    this.grid.delete(key);
    this.render();
  }

  getPixel(x: number, y: number): Color {
    return this.grid.get(pixelKey(x, y)) || TRANSPARENT;
  }

  resize(width: number, height: number): void {
    const newGrid = new Map<string, Color>();
    for (const [key, color] of this.grid) {
      const [px, py] = key.split(',').map(Number);
      if (px < width && py < height) {
        newGrid.set(key, color);
      }
    }
    this.grid = newGrid;
    this._size = { width, height };
    this.resizeCanvasElement();
  }

  zoomIn(): void {
    if (this._zoom < 64) {
      this._zoom = Math.min(64, this._zoom * 2);
      this.resizeCanvasElement();
    }
  }

  zoomOut(): void {
    if (this._zoom > 1) {
      this._zoom = Math.max(1, this._zoom / 2);
      this.resizeCanvasElement();
    }
  }

  pan(dx: number, dy: number): void {
    this._panX += dx;
    this._panY += dy;
    this.canvas.style.transform = `translate(${this._panX}px, ${this._panY}px)`;
  }

  toggleGrid(): void {
    this._showGrid = !this._showGrid;
    this.render();
  }

  setCursor(x: number, y: number): void {
    this._cursorX = x;
    this._cursorY = y;
    this.render();
  }

  canvasToPixel(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / this._zoom);
    const y = Math.floor((clientY - rect.top) / this._zoom);
    return { x, y };
  }

  getGridData(): Map<string, Color> {
    return new Map(this.grid);
  }

  setGridData(data: Map<string, Color>): void {
    this.grid = new Map(data);
    this.render();
  }

  clear(): void {
    this.grid.clear();
    this.render();
  }

  render(): void {
    const { width, height } = this._size;
    const z = this._zoom;
    this.ctx.clearRect(0, 0, width * z, height * z);

    // Checkerboard background for transparency
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#e0e0e0';
        this.ctx.fillRect(x * z, y * z, z, z);
      }
    }

    // Draw pixels
    for (const [key, color] of this.grid) {
      const [px, py] = key.split(',').map(Number);
      this.ctx.fillStyle = colorToCSS(color);
      this.ctx.fillRect(px * z, py * z, z, z);
    }

    // Grid overlay
    if (this._showGrid && z >= 4) {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      this.ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x * z, 0);
        this.ctx.lineTo(x * z, height * z);
        this.ctx.stroke();
      }
      for (let y = 0; y <= height; y++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y * z);
        this.ctx.lineTo(width * z, y * z);
        this.ctx.stroke();
      }
    }

    // Cursor preview
    if (this._cursorX >= 0 && this._cursorX < width && this._cursorY >= 0 && this._cursorY < height) {
      this.ctx.strokeStyle = 'rgba(255,0,0,0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this._cursorX * z, this._cursorY * z, z, z);
    }
  }
}
