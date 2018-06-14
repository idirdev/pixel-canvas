import { Color, colorToCSS } from './types.js';

const PRESET_COLORS: Color[] = [
  // Basic 16
  { r: 0, g: 0, b: 0, a: 255 },       { r: 255, g: 255, b: 255, a: 255 },
  { r: 255, g: 0, b: 0, a: 255 },       { r: 0, g: 255, b: 0, a: 255 },
  { r: 0, g: 0, b: 255, a: 255 },       { r: 255, g: 255, b: 0, a: 255 },
  { r: 255, g: 0, b: 255, a: 255 },     { r: 0, g: 255, b: 255, a: 255 },
  { r: 128, g: 128, b: 128, a: 255 },   { r: 192, g: 192, b: 192, a: 255 },
  { r: 128, g: 0, b: 0, a: 255 },       { r: 0, g: 128, b: 0, a: 255 },
  { r: 0, g: 0, b: 128, a: 255 },       { r: 128, g: 128, b: 0, a: 255 },
  { r: 128, g: 0, b: 128, a: 255 },     { r: 0, g: 128, b: 128, a: 255 },
  // Extended 16
  { r: 255, g: 165, b: 0, a: 255 },     { r: 255, g: 105, b: 180, a: 255 },
  { r: 75, g: 0, b: 130, a: 255 },      { r: 240, g: 230, b: 140, a: 255 },
  { r: 173, g: 216, b: 230, a: 255 },   { r: 34, g: 139, b: 34, a: 255 },
  { r: 210, g: 105, b: 30, a: 255 },    { r: 64, g: 64, b: 64, a: 255 },
  { r: 220, g: 20, b: 60, a: 255 },     { r: 70, g: 130, b: 180, a: 255 },
  { r: 154, g: 205, b: 50, a: 255 },    { r: 255, g: 215, b: 0, a: 255 },
  { r: 138, g: 43, b: 226, a: 255 },    { r: 244, g: 164, b: 96, a: 255 },
  { r: 47, g: 79, b: 79, a: 255 },      { r: 255, g: 228, b: 196, a: 255 },
];

export class Palette {
  private container: HTMLElement;
  private currentColor: Color = { r: 0, g: 0, b: 0, a: 255 };
  private recentColors: Color[] = [];
  private maxRecent: number = 12;
  private onSelect: (color: Color) => void;

  constructor(container: HTMLElement, onSelect: (color: Color) => void) {
    this.container = container;
    this.onSelect = onSelect;
    this.render();
  }

  get color(): Color { return { ...this.currentColor }; }

  setColor(color: Color): void {
    this.currentColor = { ...color };
    this.addRecent(color);
    this.render();
  }

  private addRecent(color: Color): void {
    const css = colorToCSS(color);
    this.recentColors = this.recentColors.filter(c => colorToCSS(c) !== css);
    this.recentColors.unshift({ ...color });
    if (this.recentColors.length > this.maxRecent) this.recentColors.pop();
  }

  private render(): void {
    this.container.innerHTML = '';

    // Current color preview
    const preview = document.createElement('div');
    preview.className = 'current-color';
    preview.style.background = colorToCSS(this.currentColor);
    preview.title = `Current: ${colorToCSS(this.currentColor)}`;
    this.container.appendChild(preview);

    // Custom color input
    const input = document.createElement('input');
    input.type = 'color';
    input.value = this.colorToHex(this.currentColor);
    input.addEventListener('input', () => {
      const c = this.hexToColor(input.value);
      this.currentColor = c;
      this.onSelect(c);
      this.addRecent(c);
      preview.style.background = colorToCSS(c);
    });
    this.container.appendChild(input);

    // Preset swatches
    const grid = document.createElement('div');
    grid.className = 'palette-grid';
    for (const color of PRESET_COLORS) {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.background = colorToCSS(color);
      swatch.addEventListener('click', () => {
        this.setColor(color);
        this.onSelect(color);
      });
      grid.appendChild(swatch);
    }
    this.container.appendChild(grid);

    // Recent colors
    if (this.recentColors.length > 0) {
      const label = document.createElement('div');
      label.className = 'palette-label';
      label.textContent = 'Recent';
      this.container.appendChild(label);
      const recent = document.createElement('div');
      recent.className = 'palette-grid';
      for (const color of this.recentColors) {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.background = colorToCSS(color);
        swatch.addEventListener('click', () => {
          this.setColor(color);
          this.onSelect(color);
        });
        recent.appendChild(swatch);
      }
      this.container.appendChild(recent);
    }
  }

  private colorToHex(c: Color): string {
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`;
  }

  private hexToColor(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
  }
}
