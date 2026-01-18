import { Button, Flex } from "@radix-ui/themes";
import { UploadIcon, DownloadIcon as SaveIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
    animationsAtom,
    loadProjectDataAtom,
    projectNameAtom,
    selectedFramesAtom,
    showExportDialogAtom,
    showSettingsDialogAtom,
    sourceImagesAtom,
    spriteSheetsAtom,
    storageProviderAtom,
} from "../../state/store";
import { useAtom } from "jotai";
import type { ProjectData } from "../../storage/StorageProvider";
import { PROJECT_VERSION } from "../../types";

interface MenuBarProps {}

export const MenuBar: React.FC<MenuBarProps> = ({}) => {
    // Local component state
    const [, setShowSettingsDialog] = useAtom(showSettingsDialogAtom);
    const [, setShowExportDialog] = useAtom(showExportDialogAtom);
    const [storageProvider] = useAtom(storageProviderAtom);
    const [, loadProjectData] = useAtom(loadProjectDataAtom);
    const [, setSelectedFrames] = useAtom(selectedFramesAtom);
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [animations] = useAtom(animationsAtom);
    const [projectName] = useAtom(projectNameAtom);

    // Load project
    const loadProject = async () => {
        try {
            const projectData = await storageProvider.load();
            if (!projectData) return; // User cancelled

            loadProjectData(projectData);
            setSelectedFrames([]);
        } catch (error) {
            console.error("Failed to load project:", error);
            alert(
                "Failed to load project. The file may be corrupted or invalid."
            );
        }
    };

    // Save project
    const saveProject = async () => {
        try {
            const projectData: ProjectData = {
                version: PROJECT_VERSION,
                sourceImages: sourceImages.map((img) => ({
                    id: img.id,
                    name: img.name,
                    imageData: img.imageData,
                })),
                spriteSheets: spriteSheets.map((sheet) => ({
                    id: sheet.id,
                    name: sheet.name,
                    sourceImageId: sheet.sourceImageId,
                    offsetX: sheet.offsetX,
                    offsetY: sheet.offsetY,
                    spriteWidth: sheet.spriteWidth,
                    spriteHeight: sheet.spriteHeight,
                    spacingX: sheet.spacingX,
                    spacingY: sheet.spacingY,
                    columns: sheet.columns,
                    rows: sheet.rows,
                })),
                animations: animations.map((anim) => ({
                    id: anim.id,
                    name: anim.name,
                    spriteSheetId: anim.spriteSheetId,
                    frames: anim.frames,
                    frameRate: anim.frameRate,
                })),
            };

            await storageProvider.save(projectData, projectName);
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Failed to save project. Please try again.");
        }
    };

    return (
        <Flex
            className="top-menu-bar"
            p="2"
            align={"center"}
            justify={"between"}
        >
            <header>
                <h1 style={{ margin: "0px" }}>MonoGame Sprite Editor</h1>
            </header>
            <Flex gap={"2"}>
                <Button onClick={loadProject} title="Load Project">
                    <UploadIcon /> Load
                </Button>
                <Button onClick={saveProject} title="Save Project">
                    <SaveIcon /> Save
                </Button>
                <Button onClick={() => setShowSettingsDialog(true)}>
                    Settings
                </Button>
                <Button onClick={() => setShowExportDialog(true)}>
                    Export
                </Button>
            </Flex>
        </Flex>
    );
};
