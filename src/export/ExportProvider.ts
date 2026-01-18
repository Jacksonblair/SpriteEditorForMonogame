// Export Provider Interface
// Decouples internal app data format from external export formats

export interface ExportData {
  sourceImages: Array<{
    id: string;
    name: string;
    imageData: string;
  }>;
  spriteSheets: Array<{
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
  }>;
  animations: Array<{
    id: string;
    name: string;
    spriteSheetId: string;
    frames: number[];
    frameRate: number;
  }>;
}

export type ExportFormat = 'json' | 'xml';

export interface ExportProvider {
  name: string;
  supportedFormats: ExportFormat[];
  defaultFormat: ExportFormat;
  
  // Export data in the provider's format
  export(data: ExportData, format: ExportFormat): string;
  
  // Get file extension for a specific format
  getFileExtension(format: ExportFormat): string;
  
  // Get description of the export format
  getDescription(): string;
}
