import { PixelCanvas } from './Canvas.js';
import { Color, ToolType } from './types.js';
import { PencilTool } from './tools/Pencil.js';
import { EraserTool } from './tools/Eraser.js';
import { FillTool } from './tools/Fill.js';
import { ColorPickerTool } from './tools/ColorPicker.js';
import { ShapesTool } from './tools/Shapes.js';
import { Palette } from './Palette.js';
import { History } from './History.js';
import { Export } from './Export.js';

const container = document.getElementById('canvas-container')!;
const paletteEl = document.getElementById('palette')!;
const toolButtons = document.querySelectorAll<HTMLButtonElement>('[data-tool]');
const statusEl = document.getElementById('status')!;

const canvas = new PixelCanvas(container, 32, 32);
const pencil = new PencilTool();
const eraser = new EraserTool();
const fill = new FillTool();
const picker = new ColorPickerTool();
const shapes = new ShapesTool();
const history = new History(canvas);
const exporter = new Export(canvas);

let currentTool: ToolType = 'pencil';
let currentColor: Color = { r: 0, g: 0, b: 0, a: 255 };

const palette = new Palette(paletteEl, (color: Color) => {
  currentColor = color;
});

picker.onColorPicked((color: Color) => {
  currentColor = color;
  palette.setColor(color);
  setTool('pencil');
});

function setTool(tool: ToolType): void {
  currentTool = tool;
  toolButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  statusEl.textContent = `Tool: ${tool}`;
}

toolButtons.forEach(btn => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool as ToolType));
});

canvas.element.addEventListener('mousedown', (e: MouseEvent) => {
  const { x, y } = canvas.canvasToPixel(e.clientX, e.clientY);
  switch (currentTool) {
    case 'pencil': pencil.onMouseDown(canvas, x, y, currentColor); break;
    case 'eraser': eraser.onMouseDown(canvas, x, y); break;
    case 'fill': fill.onMouseDown(canvas, x, y, currentColor); history.saveState(); break;
    case 'picker': picker.onMouseDown(canvas, x, y); break;
    case 'line': shapes.shapeType = 'line'; shapes.onMouseDown(canvas, x, y); break;
    case 'rect': shapes.shapeType = 'rect'; shapes.onMouseDown(canvas, x, y); break;
  }
});

canvas.element.addEventListener('mousemove', (e: MouseEvent) => {
  const { x, y } = canvas.canvasToPixel(e.clientX, e.clientY);
  canvas.setCursor(x, y);
  switch (currentTool) {
    case 'pencil': pencil.onMouseMove(canvas, x, y, currentColor); break;
    case 'eraser': eraser.onMouseMove(canvas, x, y); break;
    case 'line': case 'rect': shapes.onMouseMove(canvas, x, y, currentColor); break;
  }
});

canvas.element.addEventListener('mouseup', (e: MouseEvent) => {
  const { x, y } = canvas.canvasToPixel(e.clientX, e.clientY);
  if (currentTool === 'pencil') { pencil.onMouseUp(); history.saveState(); }
  else if (currentTool === 'eraser') { eraser.onMouseUp(); history.saveState(); }
  else if (currentTool === 'line' || currentTool === 'rect') {
    shapes.onMouseUp(canvas, x, y, currentColor); history.saveState();
  }
});

canvas.element.addEventListener('mouseleave', () => {
  canvas.setCursor(-1, -1);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); history.undo(); }
  else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); history.redo(); }
  else if (e.key === 'b') setTool('pencil');
  else if (e.key === 'e') setTool('eraser');
  else if (e.key === 'g') setTool('fill');
  else if (e.key === 'i') setTool('picker');
  else if (e.key === 'l') setTool('line');
  else if (e.key === 'r') setTool('rect');
  else if (e.key === '+' || e.key === '=') canvas.zoomIn();
  else if (e.key === '-') canvas.zoomOut();
  else if (e.key === '#') canvas.toggleGrid();
});

// Export buttons
document.getElementById('btn-export-png')?.addEventListener('click', () => exporter.downloadPNG());
document.getElementById('btn-export-json')?.addEventListener('click', () => exporter.downloadJSON());
document.getElementById('btn-copy')?.addEventListener('click', () => exporter.copyToClipboard());
document.getElementById('btn-load')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => exporter.loadJSON(reader.result as string);
    reader.readAsText(file);
  };
  input.click();
});

// Canvas size controls
document.getElementById('btn-resize')?.addEventListener('click', () => {
  const w = parseInt((document.getElementById('canvas-width') as HTMLInputElement).value);
  const h = parseInt((document.getElementById('canvas-height') as HTMLInputElement).value);
  if (w > 0 && h > 0 && w <= 256 && h <= 256) {
    canvas.resize(w, h);
    history.clear();
  }
});

setTool('pencil');
statusEl.textContent = 'Tool: pencil | Ready';
