import { atom } from "jotai";
import type {
    SourceImage,
    SpriteSheetConfig,
    Animation,
    AppConfig,
} from "../types";
import { DEFAULT_CONFIG } from "../types";
import type { ExportProvider } from "../export/ExportProvider";
import { MonoGameExtendedExportProvider } from "../export/MonoGameExtendedExportProvider";
import type { StorageProvider } from "../storage/StorageProvider";
import { LocalFileStorageProvider } from "../storage/LocalFileStorageProvider";

// Move GLOBAL state into this. Or just state thats shared between 2 or more components generally.
export const sourceImagesAtom = atom<SourceImage[]>([]);
export const spriteSheetsAtom = atom<SpriteSheetConfig[]>([]);
export const animationsAtom = atom<Animation[]>([]);

// App config with localStorage persistence
const getInitialConfig = (): AppConfig => {
    const saved = localStorage.getItem("spriteEditorConfig");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export const appConfigAtom = atom<AppConfig>(getInitialConfig());
export const availableExportProvidersAtom = atom<ExportProvider[]>([
    new MonoGameExtendedExportProvider(),
]);
export const storageProviderAtom = atom<StorageProvider>(
    new LocalFileStorageProvider()
);
export const projectNameAtom = atom("Untitled project");

// Selection state
export const selectedSheetIdAtom = atom<string | null>(null);
export const selectedAnimationIdAtom = atom<string | null>(null);
export const selectedImageIdAtom = atom<string | null>(null);
export const editingSheetIdAtom = atom<string | null>(null);
export const editingAnimationIdAtom = atom<string | null>(null);
export const selectedSourceImageAtom = atom((get) => {
    const selectedSheet = get(selectedSheetAtom);
    if (!selectedSheet) return;
    const image = get(sourceImagesAtom).find(
        (si) => si.id === selectedSheet.sourceImageId
    );
    return image;
});
export const selectedSheetAtom = atom((get) => {
    const id = get(selectedSheetIdAtom);
    return get(spriteSheetsAtom).find((ss) => ss.id == id);
});
export const selectedFramesAtom = atom<number[]>([]);
export const selectedAnimationAtom = atom((get) => {
    const id = get(selectedAnimationIdAtom);
    return get(animationsAtom).find((a) => a.id === id);
});

// Dialog state
export const showSettingsDialogAtom = atom(false);
export const showExportDialogAtom = atom(false);

// ============================================================================
// NAVIGATION ATOMS - Encapsulate navigation logic between images/sheets/animations
// ============================================================================

// Navigate to image (clears sheet and animation)
export const navigateToImageAtom = atom(
    null,
    (get, set, imageId: string) => {
        set(selectedImageIdAtom, imageId);
        set(selectedSheetIdAtom, null);
        set(selectedAnimationIdAtom, null);
    }
);

// Navigate to sprite sheet (clears animation)
export const navigateToSheetAtom = atom(
    null,
    (get, set, sheetId: string) => {
        set(selectedSheetIdAtom, sheetId);
        set(selectedAnimationIdAtom, null);
    }
);

// Navigate to animation
export const navigateToAnimationAtom = atom(
    null,
    (get, set, animationId: string) => {
        set(selectedAnimationIdAtom, animationId);
    }
);

// ============================================================================
// MUTATOR ATOMS - Write-only atoms for state mutations
// ============================================================================

// Add source image
export const addSourceImageAtom = atom(
    null,
    (get, set, newImage: SourceImage) => {
        const current = get(sourceImagesAtom);
        set(sourceImagesAtom, [...current, newImage]);
        set(selectedImageIdAtom, newImage.id);
    }
);

// Delete source image (and cascade delete sprite sheets and animations)
export const deleteSourceImageAtom = atom(null, (get, set, imageId: string) => {
    const spriteSheets = get(spriteSheetsAtom);
    const animations = get(animationsAtom);

    // Find sprite sheets to delete
    const sheetsToDelete = spriteSheets.filter(
        (s) => s.sourceImageId === imageId
    );
    const sheetIdsToDelete = sheetsToDelete.map((s) => s.id);

    // Delete sprite sheets
    set(
        spriteSheetsAtom,
        spriteSheets.filter((s) => s.sourceImageId !== imageId)
    );

    // Delete animations associated with deleted sheets
    set(
        animationsAtom,
        animations.filter((a) => !sheetIdsToDelete.includes(a.spriteSheetId))
    );

    // Delete the source image
    set(
        sourceImagesAtom,
        get(sourceImagesAtom).filter((img) => img.id !== imageId)
    );

    // Clear selection if needed
    if (get(selectedImageIdAtom) === imageId) {
        set(selectedImageIdAtom, null);
    }
});

// Add sprite sheet
export const addSpriteSheetAtom = atom(
    null,
    (get, set, newSheet: SpriteSheetConfig) => {
        const current = get(spriteSheetsAtom);
        set(spriteSheetsAtom, [...current, newSheet]);
        set(selectedSheetIdAtom, newSheet.id);
    }
);

// Update sprite sheet
export const updateSpriteSheetAtom = atom(
    null,
    (
        get,
        set,
        { id, updates }: { id: string; updates: Partial<SpriteSheetConfig> }
    ) => {
        const sheets = get(spriteSheetsAtom);
        set(
            spriteSheetsAtom,
            sheets.map((sheet) =>
                sheet.id === id ? { ...sheet, ...updates } : sheet
            )
        );
    }
);

// Delete sprite sheet (and cascade delete animations)
export const deleteSpriteSheetAtom = atom(null, (get, set, sheetId: string) => {
    set(
        spriteSheetsAtom,
        get(spriteSheetsAtom).filter((s) => s.id !== sheetId)
    );
    set(
        animationsAtom,
        get(animationsAtom).filter((a) => a.spriteSheetId !== sheetId)
    );

    if (get(selectedSheetIdAtom) === sheetId) {
        set(selectedSheetIdAtom, null);
        set(selectedAnimationIdAtom, null);
    }
});

// Rename sprite sheet
export const renameSpriteSheetAtom = atom(
    null,
    (get, set, { id, name }: { id: string; name: string }) => {
        const sheets = get(spriteSheetsAtom);
        set(
            spriteSheetsAtom,
            sheets.map((sheet) =>
                sheet.id === id ? { ...sheet, name } : sheet
            )
        );
    }
);

// Add animation
export const addAnimationAtom = atom(
    null,
    (get, set, newAnimation: Animation) => {
        const current = get(animationsAtom);
        set(animationsAtom, [...current, newAnimation]);
        set(selectedAnimationIdAtom, newAnimation.id);
    }
);

// Update animation
export const updateAnimationAtom = atom(
    null,
    (
        get,
        set,
        { id, updates }: { id: string; updates: Partial<Animation> }
    ) => {
        const anims = get(animationsAtom);
        set(
            animationsAtom,
            anims.map((anim) =>
                anim.id === id ? { ...anim, ...updates } : anim
            )
        );
    }
);

// Delete animation
export const deleteAnimationAtom = atom(null, (get, set, animId: string) => {
    set(
        animationsAtom,
        get(animationsAtom).filter((a) => a.id !== animId)
    );

    if (get(selectedAnimationIdAtom) === animId) {
        set(selectedAnimationIdAtom, null);
    }
});

// Rename animation
export const renameAnimationAtom = atom(
    null,
    (get, set, { id, name }: { id: string; name: string }) => {
        const anims = get(animationsAtom);
        set(
            animationsAtom,
            anims.map((anim) => (anim.id === id ? { ...anim, name } : anim))
        );
    }
);

// Load project data
export const loadProjectDataAtom = atom(
    null,
    (
        get,
        set,
        data: {
            sourceImages: SourceImage[];
            spriteSheets: SpriteSheetConfig[];
            animations: Animation[];
        }
    ) => {
        set(sourceImagesAtom, data.sourceImages);
        set(spriteSheetsAtom, data.spriteSheets);
        set(animationsAtom, data.animations);

        // Select first sheet if available
        if (data.spriteSheets.length > 0) {
            set(selectedSheetIdAtom, data.spriteSheets[0].id);
        }

        // Clear other selections
        set(selectedAnimationIdAtom, null);
        set(selectedImageIdAtom, null);
    }
);

// Upload image file (handles async file reading)
export const uploadImageFileAtom = atom(null, async (get, set, file: File) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imageData = event.target?.result as string;

                const newSourceImage: SourceImage = {
                    id: Date.now().toString(),
                    name: file.name,
                    imageData,
                };

                set(addSourceImageAtom, newSourceImage);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
});

// Create sprite sheet from source image
export const createSheetFromImageAtom = atom(
    null,
    async (get, set, sourceImage: SourceImage) => {
        return new Promise<void>((resolve, reject) => {
            const spriteSheets = get(spriteSheetsAtom);
            const sheetsWithSameImage = spriteSheets.filter(
                (s) => s.sourceImageId === sourceImage.id
            );
            const sheetNumber = sheetsWithSameImage.length + 1;

            const img = new Image();
            img.src = sourceImage.imageData;
            img.onload = () => {
                try {
                    const newSheet: SpriteSheetConfig = {
                        id: Date.now().toString(),
                        name: `${sourceImage.name} - Sheet ${sheetNumber}`,
                        sourceImageId: sourceImage.id,
                        offsetX: 0,
                        offsetY: 0,
                        spriteWidth: Math.floor(img.width / 1),
                        spriteHeight: Math.floor(img.height / 1),
                        spacingX: 0,
                        spacingY: 0,
                        columns: 1,
                        rows: 1,
                    };
                    set(addSpriteSheetAtom, newSheet);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
        });
    }
);
