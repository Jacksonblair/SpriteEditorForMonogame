import React from "react";
import type { SpriteSheetConfig } from "../types";
import {
    selectedSheetAtom,
    sourceImagesAtom,
    spriteSheetsAtom,
    updateSpriteSheetAtom,
} from "../state/store";
import { useAtom } from "jotai";

interface SpriteSheetConfigProps {}

export const SpriteSheetConfigPanel: React.FC<
    SpriteSheetConfigProps
> = ({}) => {
    const [selectedSheet] = useAtom(selectedSheetAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [, updateSpriteSheet] = useAtom(updateSpriteSheetAtom);

    // Update sprite sheet configuration
    const updateSheetConfig = (
        field: keyof SpriteSheetConfig,
        value: number | string,
    ) => {
        if (!selectedSheet?.id) return;
        const selectedSheetId = selectedSheet.id;

        const sheet = spriteSheets.find((s) => s.id === selectedSheetId);
        if (!sheet) return;

        const updates: Partial<SpriteSheetConfig> = { [field]: value };

        // Auto-calculate sprite dimensions when columns/rows change
        if (field === "columns" || field === "rows") {
            const sourceImage = sourceImages.find(
                (img) => img.id === sheet.sourceImageId,
            );
            if (sourceImage) {
                const img = new Image();
                img.src = sourceImage.imageData;

                if (
                    field === "columns" &&
                    typeof value === "number" &&
                    value > 0
                ) {
                    const availableWidth = img.width - sheet.offsetX;
                    const totalSpacing = sheet.spacingX * (value - 1);
                    updates.spriteWidth = Math.floor(
                        (availableWidth - totalSpacing) / value,
                    );
                }

                if (
                    field === "rows" &&
                    typeof value === "number" &&
                    value > 0
                ) {
                    const availableHeight = img.height - sheet.offsetY;
                    const totalSpacing = sheet.spacingY * (value - 1);
                    updates.spriteHeight = Math.floor(
                        (availableHeight - totalSpacing) / value,
                    );
                }
            }
        }

        updateSpriteSheet({ id: selectedSheetId, updates });
    };

    if (!selectedSheet) return <></>;

    return (
        <div className="config-grid">
            <label>
                Name:
                <input
                    type="text"
                    value={selectedSheet.name}
                    onChange={(e) => updateSheetConfig("name", e.target.value)}
                />
            </label>
            <label>
                Offset X:
                <input
                    type="number"
                    value={selectedSheet.offsetX}
                    onChange={(e) =>
                        updateSheetConfig(
                            "offsetX",
                            parseInt(e.target.value) || 0,
                        )
                    }
                />
            </label>
            <label>
                Offset Y:
                <input
                    type="number"
                    value={selectedSheet.offsetY}
                    onChange={(e) =>
                        updateSheetConfig(
                            "offsetY",
                            parseInt(e.target.value) || 0,
                        )
                    }
                />
            </label>
            <label>
                Sprite Width:
                <input
                    type="number"
                    value={selectedSheet.spriteWidth}
                    onChange={(e) =>
                        updateSheetConfig(
                            "spriteWidth",
                            parseInt(e.target.value) || 1,
                        )
                    }
                />
            </label>
            <label>
                Sprite Height:
                <input
                    type="number"
                    value={selectedSheet.spriteHeight}
                    onChange={(e) =>
                        updateSheetConfig(
                            "spriteHeight",
                            parseInt(e.target.value) || 1,
                        )
                    }
                />
            </label>
            <label>
                Spacing X:
                <input
                    type="number"
                    value={selectedSheet.spacingX}
                    onChange={(e) =>
                        updateSheetConfig(
                            "spacingX",
                            parseInt(e.target.value) || 0,
                        )
                    }
                />
            </label>
            <label>
                Spacing Y:
                <input
                    type="number"
                    value={selectedSheet.spacingY}
                    onChange={(e) =>
                        updateSheetConfig(
                            "spacingY",
                            parseInt(e.target.value) || 0,
                        )
                    }
                />
            </label>
            <label>
                Columns:
                <input
                    type="number"
                    value={selectedSheet.columns}
                    onChange={(e) =>
                        updateSheetConfig(
                            "columns",
                            parseInt(e.target.value) || 1,
                        )
                    }
                />
            </label>
            <label>
                Rows:
                <input
                    type="number"
                    value={selectedSheet.rows}
                    onChange={(e) =>
                        updateSheetConfig("rows", parseInt(e.target.value) || 1)
                    }
                />
            </label>
        </div>
    );
};
