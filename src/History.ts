import { PixelCanvas } from './Canvas.js';
import { Color } from './types.js';

interface HistoryEntry {
  data: Map<string, Color>;
  timestamp: number;
}

export class History {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxHistory: number = 50;
  private canvas: PixelCanvas;

  constructor(canvas: PixelCanvas) {
    this.canvas = canvas;
    // Save initial state
    this.saveState();
  }

  saveState(): void {
    const entry: HistoryEntry = {
      data: this.canvas.getGridData(),
      timestamp: Date.now(),
    };

    this.undoStack.push(entry);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // Clear redo stack on new action
    this.redoStack = [];
  }

  undo(): boolean {
    if (this.undoStack.length <= 1) return false;

    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    const previous = this.undoStack[this.undoStack.length - 1];
    this.canvas.setGridData(new Map(previous.data));
    return true;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    this.canvas.setGridData(new Map(next.data));
    return true;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.saveState();
  }
}
