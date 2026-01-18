import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { appConfigAtom, showSettingsDialogAtom } from "../state/store";
import type { AppConfig } from "../types";
import { Button, Dialog } from "@radix-ui/themes";

interface SettingsDialogProps {}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({}) => {
    const [config, setConfig] = useAtom(appConfigAtom);
    const [showSettingsDialog, setShowSettingsDialog] = useAtom(
        showSettingsDialogAtom
    );

    // Save config to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("spriteEditorConfig", JSON.stringify(config));
    }, [config]);

    const updateConfig = (updates: Partial<AppConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    return (
        <Dialog.Root
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
        >
            <Dialog.Content>
                <Dialog.Title>Settings</Dialog.Title>
                <Dialog.Description>
                    Configure your editor preferences
                </Dialog.Description>

                <div className="settings-content">
                    <div className="setting-group">
                        <h3>Preview Background</h3>
                        <label className="setting-option">
                            <input
                                type="radio"
                                name="backgroundType"
                                checked={
                                    config.previewBackgroundType ===
                                    "checkerboard"
                                }
                                onChange={() =>
                                    updateConfig({
                                        previewBackgroundType: "checkerboard",
                                    })
                                }
                            />
                            <span>Checkerboard Pattern (for transparency)</span>
                        </label>
                        <label className="setting-option">
                            <input
                                type="radio"
                                name="backgroundType"
                                checked={
                                    config.previewBackgroundType === "color"
                                }
                                onChange={() =>
                                    updateConfig({
                                        previewBackgroundType: "color",
                                    })
                                }
                            />
                            <span>Solid Color</span>
                        </label>
                        {config.previewBackgroundType === "color" && (
                            <div className="color-picker-container">
                                <label>
                                    Background Color:
                                    <input
                                        type="color"
                                        value={config.previewBackgroundColor}
                                        onChange={(e) =>
                                            updateConfig({
                                                previewBackgroundColor:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                    <span className="color-value">
                                        {config.previewBackgroundColor}
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dialog-actions">
                    <Button
                        onClick={() => setShowSettingsDialog(false)}
                        className="dialog-btn dialog-btn-primary"
                    >
                        Done
                    </Button>
                    <Dialog.Close>
                        <Button aria-label="Close">Cancel</Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
