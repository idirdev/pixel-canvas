export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: Color;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export type ToolType = 'pencil' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect';

export interface Layer {
  id: number;
  name: string;
  visible: boolean;
  opacity: number;
  pixels: Map<string, Color>;
}

export interface Project {
  name: string;
  size: CanvasSize;
  layers: Layer[];
  activeLayerId: number;
  palette: Color[];
}

export interface ToolState {
  type: ToolType;
  size: number;
  color: Color;
}

export function colorToCSS(c: Color): string {
  return `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
}

export function colorsEqual(a: Color, b: Color): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

export function pixelKey(x: number, y: number): string {
  return `${x},${y}`;
}

export const TRANSPARENT: Color = { r: 0, g: 0, b: 0, a: 0 };
