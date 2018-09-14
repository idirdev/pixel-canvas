import { describe, it, expect } from 'vitest';
import {
  colorToCSS,
  colorsEqual,
  pixelKey,
  TRANSPARENT,
  Color,
} from '../src/types';

// Note: PixelCanvas and Palette depend on DOM (HTMLCanvasElement, document),
// so we test the pure utility functions and type helpers that don't require a browser.

describe('colorToCSS', () => {
  it('should convert a fully opaque color to CSS rgba', () => {
    const color: Color = { r: 255, g: 0, b: 128, a: 255 };
    expect(colorToCSS(color)).toBe('rgba(255,0,128,1)');
  });

  it('should convert a semi-transparent color to CSS rgba', () => {
    const color: Color = { r: 100, g: 200, b: 50, a: 128 };
    const result = colorToCSS(color);
    // a: 128 / 255 ~= 0.502
    expect(result).toMatch(/^rgba\(100,200,50,0\.50/);
  });

  it('should convert a fully transparent color', () => {
    const result = colorToCSS(TRANSPARENT);
    expect(result).toBe('rgba(0,0,0,0)');
  });

  it('should handle black', () => {
    const black: Color = { r: 0, g: 0, b: 0, a: 255 };
    expect(colorToCSS(black)).toBe('rgba(0,0,0,1)');
  });

  it('should handle white', () => {
    const white: Color = { r: 255, g: 255, b: 255, a: 255 };
    expect(colorToCSS(white)).toBe('rgba(255,255,255,1)');
  });
});

describe('colorsEqual', () => {
  it('should return true for identical colors', () => {
    const a: Color = { r: 100, g: 150, b: 200, a: 255 };
    const b: Color = { r: 100, g: 150, b: 200, a: 255 };
    expect(colorsEqual(a, b)).toBe(true);
  });

  it('should return false when red channel differs', () => {
    const a: Color = { r: 100, g: 150, b: 200, a: 255 };
    const b: Color = { r: 101, g: 150, b: 200, a: 255 };
    expect(colorsEqual(a, b)).toBe(false);
  });

  it('should return false when green channel differs', () => {
    const a: Color = { r: 100, g: 150, b: 200, a: 255 };
    const b: Color = { r: 100, g: 151, b: 200, a: 255 };
    expect(colorsEqual(a, b)).toBe(false);
  });

  it('should return false when blue channel differs', () => {
    const a: Color = { r: 100, g: 150, b: 200, a: 255 };
    const b: Color = { r: 100, g: 150, b: 201, a: 255 };
    expect(colorsEqual(a, b)).toBe(false);
  });

  it('should return false when alpha channel differs', () => {
    const a: Color = { r: 100, g: 150, b: 200, a: 255 };
    const b: Color = { r: 100, g: 150, b: 200, a: 128 };
    expect(colorsEqual(a, b)).toBe(false);
  });

  it('should recognize TRANSPARENT as equal to another transparent color', () => {
    expect(colorsEqual(TRANSPARENT, { r: 0, g: 0, b: 0, a: 0 })).toBe(true);
  });
});

describe('pixelKey', () => {
  it('should generate a comma-separated key from coordinates', () => {
    expect(pixelKey(0, 0)).toBe('0,0');
    expect(pixelKey(5, 10)).toBe('5,10');
    expect(pixelKey(31, 31)).toBe('31,31');
  });

  it('should handle large coordinates', () => {
    expect(pixelKey(1000, 2000)).toBe('1000,2000');
  });

  it('should produce unique keys for different coordinates', () => {
    expect(pixelKey(1, 2)).not.toBe(pixelKey(2, 1));
  });
});

describe('TRANSPARENT constant', () => {
  it('should be fully transparent black', () => {
    expect(TRANSPARENT.r).toBe(0);
    expect(TRANSPARENT.g).toBe(0);
    expect(TRANSPARENT.b).toBe(0);
    expect(TRANSPARENT.a).toBe(0);
  });
});

describe('Color type usage', () => {
  it('should allow creating colors with full RGBA values', () => {
    const color: Color = { r: 128, g: 64, b: 32, a: 200 };
    expect(color.r).toBe(128);
    expect(color.g).toBe(64);
    expect(color.b).toBe(32);
    expect(color.a).toBe(200);
  });
});

describe('Pixel grid logic (Map-based)', () => {
  it('should store and retrieve pixel colors by key', () => {
    const grid = new Map<string, Color>();
    const red: Color = { r: 255, g: 0, b: 0, a: 255 };
    const key = pixelKey(5, 10);
    grid.set(key, red);
    expect(grid.get(key)).toEqual(red);
  });

  it('should return undefined for unset pixel keys', () => {
    const grid = new Map<string, Color>();
    expect(grid.get(pixelKey(0, 0))).toBeUndefined();
  });

  it('should delete a pixel from the grid', () => {
    const grid = new Map<string, Color>();
    const blue: Color = { r: 0, g: 0, b: 255, a: 255 };
    const key = pixelKey(3, 7);
    grid.set(key, blue);
    grid.delete(key);
    expect(grid.has(key)).toBe(false);
  });

  it('should handle multiple pixels at different positions', () => {
    const grid = new Map<string, Color>();
    const colors: Color[] = [
      { r: 255, g: 0, b: 0, a: 255 },
      { r: 0, g: 255, b: 0, a: 255 },
      { r: 0, g: 0, b: 255, a: 255 },
    ];
    grid.set(pixelKey(0, 0), colors[0]);
    grid.set(pixelKey(1, 0), colors[1]);
    grid.set(pixelKey(0, 1), colors[2]);
    expect(grid.size).toBe(3);
    expect(grid.get(pixelKey(1, 0))).toEqual(colors[1]);
  });

  it('should simulate canvas resize by filtering out-of-bounds pixels', () => {
    const grid = new Map<string, Color>();
    const white: Color = { r: 255, g: 255, b: 255, a: 255 };
    // Place pixels in a 10x10 grid
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        grid.set(pixelKey(x, y), white);
      }
    }
    expect(grid.size).toBe(100);

    // Resize to 5x5
    const newWidth = 5;
    const newHeight = 5;
    const newGrid = new Map<string, Color>();
    for (const [key, color] of grid) {
      const [px, py] = key.split(',').map(Number);
      if (px < newWidth && py < newHeight) {
        newGrid.set(key, color);
      }
    }
    expect(newGrid.size).toBe(25);
  });
});
