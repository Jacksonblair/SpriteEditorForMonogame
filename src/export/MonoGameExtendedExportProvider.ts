import type { ExportProvider, ExportData, ExportFormat } from './ExportProvider';

/**
 * MonoGame Extended Export Provider
 * Exports sprite sheets and animations in MonoGame.Extended format
 * 
 * Based on documentation:
 * - https://www.monogameextended.net/docs/features/2d-animations/spritesheet/
 * - https://www.monogameextended.net/docs/features/2d-animations/animatedsprite/
 */
export class MonoGameExtendedExportProvider implements ExportProvider {
  name = 'MonoGame.Extended';
  supportedFormats: ExportFormat[] = ['json', 'xml'];
  defaultFormat: ExportFormat = 'json';

  getDescription(): string {
    return 'Exports sprite sheets and animations in MonoGame.Extended format with texture regions and animation cycles';
  }

  getFileExtension(format: ExportFormat): string {
    return format;
  }

  export(data: ExportData, format: ExportFormat = 'json'): string {
    const output: Record<string, any> = {};

    // Process each sprite sheet
    data.spriteSheets.forEach(sheet => {
      const sourceImage = data.sourceImages.find(img => img.id === sheet.sourceImageId);
      if (!sourceImage) return;

      // Create texture atlas for this sprite sheet
      const textureAtlas = {
        texture: sourceImage.name,
        regionWidth: sheet.spriteWidth,
        regionHeight: sheet.spriteHeight,
        regions: [] as any[]
      };

      // Calculate all sprite regions
      const frames = [];
      for (let row = 0; row < sheet.rows; row++) {
        for (let col = 0; col < sheet.columns; col++) {
          const frameIndex = row * sheet.columns + col;
          const region = {
            name: `${sheet.name}_${frameIndex}`,
            x: sheet.offsetX + col * (sheet.spriteWidth + sheet.spacingX),
            y: sheet.offsetY + row * (sheet.spriteHeight + sheet.spacingY),
            width: sheet.spriteWidth,
            height: sheet.spriteHeight
          };
          textureAtlas.regions.push(region);
          frames.push(region.name);
        }
      }

      // Add sprite sheet to output
      output[sheet.name] = {
        textureAtlas,
        frames
      };

      // Process animations for this sprite sheet
      const sheetAnimations = data.animations.filter(
        anim => anim.spriteSheetId === sheet.id
      );

      if (sheetAnimations.length > 0) {
        output[sheet.name].animations = {};
        
        sheetAnimations.forEach(anim => {
          // MonoGame Extended uses frame duration in seconds
          const frameDuration = 1.0 / anim.frameRate;
          
          output[sheet.name].animations[anim.name] = {
            frames: anim.frames.map(frameIndex => ({
              regionName: `${sheet.name}_${frameIndex}`,
              duration: frameDuration
            })),
            isLooping: true,
            frameDuration
          };
        });
      }
    });

    if (format === 'json') {
      return JSON.stringify(output, null, 2);
    } else if (format === 'xml') {
      // XML export implementation
      return this.convertToXML(output);
    }
    
    return JSON.stringify(output, null, 2);
  }

  private convertToXML(data: Record<string, any>): string {
    // Simple XML conversion
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<SpriteAtlas>\n';
    
    for (const [sheetName, sheetData] of Object.entries(data)) {
      xml += `  <SpriteSheet name="${sheetName}">\n`;
      
      // Texture Atlas
      const atlas = sheetData.textureAtlas;
      xml += `    <TextureAtlas texture="${atlas.texture}" regionWidth="${atlas.regionWidth}" regionHeight="${atlas.regionHeight}">\n`;
      atlas.regions.forEach((region: any) => {
        xml += `      <Region name="${region.name}" x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}" />\n`;
      });
      xml += `    </TextureAtlas>\n`;
      
      // Frames
      xml += `    <Frames>\n`;
      sheetData.frames.forEach((frame: string) => {
        xml += `      <Frame>${frame}</Frame>\n`;
      });
      xml += `    </Frames>\n`;
      
      // Animations
      if (sheetData.animations) {
        xml += `    <Animations>\n`;
        for (const [animName, animData] of Object.entries(sheetData.animations)) {
          const anim: any = animData;
          xml += `      <Animation name="${animName}" isLooping="${anim.isLooping}" frameDuration="${anim.frameDuration}">\n`;
          anim.frames.forEach((frame: any) => {
            xml += `        <Frame regionName="${frame.regionName}" duration="${frame.duration}" />\n`;
          });
          xml += `      </Animation>\n`;
        }
        xml += `    </Animations>\n`;
      }
      
      xml += `  </SpriteSheet>\n`;
    }
    
    xml += '</SpriteAtlas>';
    return xml;
  }
}
