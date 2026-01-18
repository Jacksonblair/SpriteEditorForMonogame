import type { StorageProvider, ProjectData } from './StorageProvider';

/**
 * Local File Storage Provider
 * Saves project data to the user's local machine using file downloads/uploads
 */
export class LocalFileStorageProvider implements StorageProvider {
  name = 'Local File';

  isAvailable(): boolean {
    // Always available in browsers
    return true;
  }

  async save(data: ProjectData, projectName: string): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.sprite-project.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project to local file');
    }
  }

  async load(): Promise<ProjectData | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.sprite-project.json,application/json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const text = await file.text();
          const data = JSON.parse(text) as ProjectData;
          
          // Validate the data structure
          if (!data.version || !data.sourceImages || !data.spriteSheets || !data.animations) {
            throw new Error('Invalid project file format');
          }
          
          resolve(data);
        } catch (error) {
          console.error('Failed to load project:', error);
          reject(new Error('Failed to load project from file'));
        }
      };
      
      input.oncancel = () => {
        resolve(null);
      };
      
      input.click();
    });
  }
}
