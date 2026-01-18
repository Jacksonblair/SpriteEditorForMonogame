// Type definitions for the Sprite Editor

export interface SourceImage {
  id: string;
  name: string;
  imageData: string;
}

export interface SpriteSheetConfig {
  id: string;
  name: string;
  sourceImageId: string;
  offsetX: number;
  offsetY: number;
  spriteWidth: number;
  spriteHeight: number;
  spacingX: number;
  spacingY: number;
  columns: number;
  rows: number;
}

export interface Animation {
  id: string;
  name: string;
  spriteSheetId: string;
  frames: number[];
  frameRate: number;
}

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppConfig {
  previewBackgroundType: 'checkerboard' | 'color';
  previewBackgroundColor: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  previewBackgroundType: 'checkerboard',
  previewBackgroundColor: '#1a1a1a',
};

export const PROJECT_VERSION = '1.0.0';
