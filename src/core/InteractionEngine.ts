import { type CandleData } from "@/charts/Candle";
import { type Level } from "@/charts/Levels";
import { type IndicatorData } from "@/charts/IndicatorPanel";

export interface InteractionEvent {
  type: "candle-click" | "level-click" | "signal-click" | "pattern-select" | "level-draw";
  data: any;
  timestamp: number;
}

export interface InteractionState {
  selectedCandles: number[];
  selectedLevels: Level[];
  selectedSignals: number[];
  drawnLevels: Level[];
  hoveredElement?: {
    type: "candle" | "level" | "signal";
    index: number;
  };
}

export class InteractionEngine {
  private state: InteractionState = {
    selectedCandles: [],
    selectedLevels: [],
    selectedSignals: [],
    drawnLevels: [],
  };
  
  private listeners: Map<string, ((event: InteractionEvent) => void)[]> = new Map();
  
  on(eventType: string, callback: (event: InteractionEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }
  
  off(eventType: string, callback: (event: InteractionEvent) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  private emit(event: InteractionEvent) {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(cb => cb(event));
  }
  
  handleCandleClick(candle: CandleData, index: number) {
    const isSelected = this.state.selectedCandles.includes(index);
    
    if (isSelected) {
      this.state.selectedCandles = this.state.selectedCandles.filter(i => i !== index);
    } else {
      this.state.selectedCandles.push(index);
    }
    
    this.emit({
      type: "candle-click",
      data: { candle, index, selected: !isSelected },
      timestamp: Date.now(),
    });
  }
  
  handleLevelClick(level: Level) {
    const isSelected = this.state.selectedLevels.some(l => l.price === level.price);
    
    if (isSelected) {
      this.state.selectedLevels = this.state.selectedLevels.filter(l => l.price !== level.price);
    } else {
      this.state.selectedLevels.push(level);
    }
    
    this.emit({
      type: "level-click",
      data: { level, selected: !isSelected },
      timestamp: Date.now(),
    });
  }
  
  handleSignalClick(signal: IndicatorData["signals"][0], index: number) {
    const isSelected = this.state.selectedSignals.includes(index);
    
    if (isSelected) {
      this.state.selectedSignals = this.state.selectedSignals.filter(i => i !== index);
    } else {
      this.state.selectedSignals.push(index);
    }
    
    this.emit({
      type: "signal-click",
      data: { signal, index, selected: !isSelected },
      timestamp: Date.now(),
    });
  }
  
  drawLevel(price: number, type: "support" | "resistance") {
    const level: Level = {
      price,
      type,
      strength: 0.5,
      touches: 0,
    };
    
    this.state.drawnLevels.push(level);
    
    this.emit({
      type: "level-draw",
      data: { level },
      timestamp: Date.now(),
    });
    
    return level;
  }
  
  clearSelection() {
    this.state.selectedCandles = [];
    this.state.selectedLevels = [];
    this.state.selectedSignals = [];
  }
  
  getState(): InteractionState {
    return { ...this.state };
  }
  
  setHovered(element?: { type: "candle" | "level" | "signal"; index: number }) {
    this.state.hoveredElement = element;
  }
}




