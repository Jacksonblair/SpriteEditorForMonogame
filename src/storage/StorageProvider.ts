// Storage Provider Interface
export interface ProjectData {
  version: string;
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

export interface StorageProvider {
  name: string;
  
  // Save project data
  save(data: ProjectData, projectName: string): Promise<void>;
  
  // Load project data
  load(): Promise<ProjectData | null>;
  
  // Check if provider is available
  isAvailable(): boolean;
}
