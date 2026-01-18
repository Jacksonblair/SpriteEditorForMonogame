import React, { useMemo, useState, type ComponentProps } from "react";
import {
    ControlledTreeEnvironment,
    Tree,
    type TreeItem,
    type TreeItemIndex,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
    sourceImagesAtom,
    spriteSheetsAtom,
    animationsAtom,
    createSheetFromImageAtom,
    addAnimationAtom,
    navigateToImageAtom,
    navigateToSheetAtom,
    navigateToAnimationAtom,
} from "../../state/store";
import type { SourceImage, SpriteSheetConfig, Animation } from "../../types";
import "./TreeView.css";

interface TreeViewProps {}

type TreeItemData = {};

const TREE_ID = "sidebar-tree";

/**
 * Generate tree items from the global state
 * This function is called whenever images, sprite sheets, or animations change
 */
export function generateTreeItems(
    sourceImages: SourceImage[],
    spriteSheets: SpriteSheetConfig[],
    animations: Animation[],
): Record<string, TreeItem> {
    const items: Record<string, TreeItem> = {
        root: {
            index: "root",
            canMove: false,
            isFolder: true,
            children: ["images-folder"],
            data: "📁 Project",
            canRename: false,
        },
        "images-folder": {
            index: "images-folder",
            canMove: false,
            isFolder: true,
            children: sourceImages.map((img) => `image-${img.id}`),
            data: `📂 Images (${sourceImages.length})`,
            canRename: false,
        },
    };

    // Add source images
    sourceImages.forEach((image) => {
        const imageKey = `image-${image.id}`;
        const imageSpriteSheets = spriteSheets.filter(
            (sheet) => sheet.sourceImageId === image.id,
        );
        const spritesheetsFolder = `spritesheets-${image.id}`;

        items[imageKey] = {
            index: imageKey,
            canMove: false,
            isFolder: true,
            children: [spritesheetsFolder],
            data: `🖼️ ${image.name}`,
            canRename: false,
        };

        // Add Spritesheets folder for this image
        const addSheetKey = `add-sheet-${image.id}`;
        items[spritesheetsFolder] = {
            index: spritesheetsFolder,
            canMove: false,
            isFolder: true,
            children: [
                ...imageSpriteSheets.map((sheet) => `sheet-${sheet.id}`),
                addSheetKey,
            ],
            data: `📂 Spritesheets (${imageSpriteSheets.length})`,
            canRename: false,
        };

        // Add "Create New Sprite Sheet" item
        items[addSheetKey] = {
            index: addSheetKey,
            canMove: false,
            isFolder: false,
            children: [],
            data: "➕ New Sprite Sheet",
            canRename: false,
        };

        // Add sprite sheets for this image
        imageSpriteSheets.forEach((sheet) => {
            const sheetKey = `sheet-${sheet.id}`;
            const sheetAnimations = animations.filter(
                (anim) => anim.spriteSheetId === sheet.id,
            );
            const animationsFolder = `animations-${sheet.id}`;

            items[sheetKey] = {
                index: sheetKey,
                canMove: false,
                isFolder: true,
                children: [animationsFolder],
                data: `📋 ${sheet.name}`,
                canRename: false,
            };

            // Add Animations folder for this sheet
            const addAnimKey = `add-anim-${sheet.id}`;
            items[animationsFolder] = {
                index: animationsFolder,
                canMove: false,
                isFolder: true,
                children: [
                    ...sheetAnimations.map((anim) => `anim-${anim.id}`),
                    addAnimKey,
                ],
                data: `📂 Animations (${sheetAnimations.length})`,
                canRename: false,
            };

            // Add "Create New Animation" item
            items[addAnimKey] = {
                index: addAnimKey,
                canMove: false,
                isFolder: false,
                children: [],
                data: "➕ New Animation",
                canRename: false,
            };

            // Add animations for this sheet
            sheetAnimations.forEach((anim) => {
                const animKey = `anim-${anim.id}`;

                items[animKey] = {
                    index: animKey,
                    canMove: false,
                    isFolder: false,
                    children: [],
                    data: `🎬 ${anim.name}`,
                    canRename: false,
                };
            });
        });
    });

    return items;
}

export const TreeView: React.FC<TreeViewProps> = ({}) => {
    const sourceImages = useAtomValue(sourceImagesAtom);
    const spriteSheets = useAtomValue(spriteSheetsAtom);
    const animations = useAtomValue(animationsAtom);

    const createSheetFromImage = useSetAtom(createSheetFromImageAtom);
    const addAnimation = useSetAtom(addAnimationAtom);
    const navigateToImage = useSetAtom(navigateToImageAtom);
    const navigateToSheet = useSetAtom(navigateToSheetAtom);
    const navigateToAnimation = useSetAtom(navigateToAnimationAtom);

    const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
    const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
    const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

    // Auto-expand all folder items
    const allFolderKeys = useMemo(() => {
        const folders = ["images-folder"];
        sourceImages.forEach((image) => {
            folders.push(`spritesheets-${image.id}`);
        });
        spriteSheets.forEach((sheet) => {
            folders.push(`animations-${sheet.id}`);
        });
        return folders;
    }, [sourceImages, spriteSheets]);

    // Keep folders expanded
    React.useEffect(() => {
        const newExpanded = [...new Set([...expandedItems, ...allFolderKeys])];
        if (
            newExpanded.length !== expandedItems.length ||
            !allFolderKeys.every((f) => expandedItems.includes(f))
        ) {
            setExpandedItems(newExpanded);
        }
    }, [allFolderKeys]);

    const items: ComponentProps<typeof ControlledTreeEnvironment>["items"] =
        useMemo(() => {
            return generateTreeItems(sourceImages, spriteSheets, animations);
        }, [sourceImages, spriteSheets, animations]);

    const handleSelectItems = (itemIds: TreeItemIndex[]) => {
        if (itemIds.length === 0) return;

        const itemId = String(itemIds[0]);

        // Ignore selection of folder items
        if (
            itemId === "images-folder" ||
            itemId.startsWith("spritesheets-") ||
            itemId.startsWith("animations-")
        ) {
            return;
        }

        // Handle "Create New Sprite Sheet" click
        if (itemId.startsWith("add-sheet-")) {
            const imageId = itemId.replace("add-sheet-", "");
            const sourceImage = sourceImages.find((img) => img.id === imageId);
            if (sourceImage) {
                createSheetFromImage(sourceImage);
            }
            return;
        }

        // Handle "Create New Animation" click
        if (itemId.startsWith("add-anim-")) {
            const sheetId = itemId.replace("add-anim-", "");
            const spriteSheet = spriteSheets.find(
                (sheet) => sheet.id === sheetId,
            );
            if (spriteSheet) {
                const newAnimation: Animation = {
                    id: Date.now().toString(),
                    name: `New Animation ${animations.filter((a) => a.spriteSheetId === sheetId).length + 1}`,
                    spriteSheetId: sheetId,
                    frames: [],
                    frameRate: 10,
                };
                addAnimation(newAnimation);
            }
            return;
        }

        // Handle navigation for regular items
        if (itemId.startsWith("image-")) {
            const imageId = itemId.replace("image-", "");
            navigateToImage(imageId);

            // Accordion behavior for images: expand this image, collapse other images
            const allImageKeys = sourceImages.map((img) => `image-${img.id}`);
            const nonImageExpandedItems = expandedItems.filter(
                (id) => !allImageKeys.includes(String(id)),
            );
            setExpandedItems([...nonImageExpandedItems, itemId]);

            setSelectedItems(itemIds);
            return;
        }

        if (itemId.startsWith("sheet-")) {
            const sheetId = itemId.replace("sheet-", "");
            navigateToSheet(sheetId);

            // Accordion behavior: expand this sheet, collapse other sheets
            const allSheetKeys = spriteSheets.map((s) => `sheet-${s.id}`);
            const allImageKeys = sourceImages.map((img) => `image-${img.id}`);
            // Keep images expanded, only collapse other sheets
            const otherExpandedItems = expandedItems.filter((id) => {
                const idStr = String(id);
                return !allSheetKeys.includes(idStr) || idStr === itemId;
            });
            setExpandedItems([...otherExpandedItems, itemId]);

            setSelectedItems(itemIds);
            return;
        }

        if (itemId.startsWith("anim-")) {
            const animId = itemId.replace("anim-", "");
            navigateToAnimation(animId);
            setSelectedItems(itemIds);
            return;
        }

        // Handle other items (like root)
        setSelectedItems(itemIds);
    };

    return (
        <ControlledTreeEnvironment
            items={items}
            getItemTitle={(item) => String(item.data)}
            viewState={{
                [TREE_ID]: {
                    focusedItem,
                    expandedItems,
                },
            }}
            onFocusItem={(item) => setFocusedItem(item.index)}
            onExpandItem={(item) =>
                setExpandedItems([...expandedItems, item.index])
            }
            onCollapseItem={(item) =>
                setExpandedItems(
                    expandedItems.filter((id) => id !== item.index),
                )
            }
            onSelectItems={handleSelectItems}
        >
            <Tree
                renderDepthOffset={20}
                treeId={TREE_ID}
                rootItem="root"
                treeLabel="Project Structure"
            />
        </ControlledTreeEnvironment>
    );
};
