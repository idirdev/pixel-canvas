# Pixel Canvas

![TypeScript](https://img.shields.io/badge/TypeScript-4.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![No Framework](https://img.shields.io/badge/framework-none-lightgrey)

A lightweight pixel art editor built with vanilla TypeScript and HTML Canvas. No frameworks, no dependencies at runtime -- just pure TypeScript compiled to ES modules.

## Features

- **Drawing Tools** -- Pencil, Eraser, Flood Fill, Color Picker, Line, Rectangle
- **Smooth Strokes** -- Bresenham line interpolation between mouse points
- **Flood Fill** -- BFS-based fill with configurable color tolerance
- **Shape Drawing** -- Live preview while dragging lines and rectangles
- **Color Palette** -- 32 preset colors + custom color picker + recent colors history
- **Undo/Redo** -- Full command history stack (up to 50 states)
- **Zoom & Pan** -- Zoom in/out (1x to 64x), pan the canvas around
- **Grid Overlay** -- Toggle pixel grid for precision editing
- **Cursor Preview** -- Highlighted pixel under cursor
- **Export** -- PNG (scaled up), JSON (project save/load), clipboard copy
- **Resizable Canvas** -- 1x1 up to 256x256 pixels

## Controls & Shortcuts

| Key | Action |
|-----|--------|
| `B` | Pencil tool |
| `E` | Eraser tool |
| `G` | Fill tool |
| `I` | Color Picker tool |
| `L` | Line tool |
| `R` | Rectangle tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `+` / `-` | Zoom in / out |
| `#` | Toggle grid |

## Export Formats

| Format | Description |
|--------|-------------|
| PNG | Scaled-up pixel art image (8x default scale) |
| JSON | Full project state -- pixels, size, colors. Can be loaded back. |
| Clipboard | Copies PNG to clipboard (4x scale) |

## Getting Started

```bash
npm install
npm run build
npm run dev
```

The app will open in your browser via lite-server.

## Project Structure

```
src/
  types.ts        Type definitions (Color, Pixel, Tool, Layer, Project)
  Canvas.ts       Core pixel canvas with rendering and grid
  Palette.ts      Color palette UI with presets and recent colors
  History.ts      Undo/redo command stack
  Export.ts       PNG/JSON/clipboard export
  app.ts          Main application entry point
  tools/
    Pencil.ts     Pencil drawing with Bresenham interpolation
    Eraser.ts     Eraser (transparent drawing)
    Fill.ts       Flood fill with BFS and tolerance
    ColorPicker.ts  Pick color from canvas
    Shapes.ts     Line and rectangle tools with preview
```

## Architecture

The editor uses a simple pixel grid stored as a `Map<string, Color>` where keys are `"x,y"` coordinate strings. The HTML Canvas element is used purely for rendering -- all pixel data lives in the map. This makes serialization, undo/redo, and flood fill straightforward.

Tools follow a consistent interface pattern with `onMouseDown`, `onMouseMove`, and `onMouseUp` handlers. The History module captures full canvas snapshots for undo/redo, keeping up to 50 states in memory.

## License

MIT
