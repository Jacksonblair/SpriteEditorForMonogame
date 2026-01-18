import React, { useState, useEffect } from "react";
import { DownloadIcon, CopyIcon } from "@radix-ui/react-icons";
import JsonView from "@uiw/react-json-view";
import { useAtom } from "jotai";
import {
    sourceImagesAtom,
    spriteSheetsAtom,
    animationsAtom,
    availableExportProvidersAtom,
    showExportDialogAtom,
} from "../state/store";
import type { ExportFormat } from "../export/ExportProvider";
import { Button, Dialog } from "@radix-ui/themes";

interface ExportDialogProps {}

export const ExportDialog: React.FC<ExportDialogProps> = ({}) => {
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [animations] = useAtom(animationsAtom);
    const [availableExportProviders] = useAtom(availableExportProvidersAtom);

    const [showExportDialog, setShowExportDialog] =
        useAtom(showExportDialogAtom);

    const [selectedExportProviderIndex, setSelectedExportProviderIndex] =
        useState(0);
    const [selectedExportFormat, setSelectedExportFormat] =
        useState<ExportFormat>("json");
    const [jsonPreview, setJsonPreview] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);

    const exportProvider =
        availableExportProviders[selectedExportProviderIndex];

    // Generate export data
    const generateExport = (): string => {
        const exportData = {
            sourceImages,
            spriteSheets,
            animations,
        };

        return exportProvider.export(exportData, selectedExportFormat);
    };

    // Update preview when dialog opens or data changes
    useEffect(() => {
        if (showExportDialog) {
            const exportString = generateExport();
            setJsonPreview(exportString);
        }
    }, [
        showExportDialog,
        selectedExportProviderIndex,
        selectedExportFormat,
        sourceImages,
        spriteSheets,
        animations,
    ]);

    // Download export file
    const downloadExport = () => {
        const mimeType =
            selectedExportFormat === "json"
                ? "application/json"
                : "application/xml";
        const blob = new Blob([jsonPreview], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sprite_atlas.${exportProvider.getFileExtension(
            selectedExportFormat
        )}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonPreview);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <Dialog.Root open={showExportDialog} onOpenChange={setShowExportDialog}>
            <Dialog.Content>
                <Dialog.Title>Export Preview</Dialog.Title>
                <Dialog.Description>
                    Select an export format and preview the output
                </Dialog.Description>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            color: "#aaa",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                        }}
                    >
                        Export Target:
                        <select
                            value={selectedExportProviderIndex}
                            onChange={(e) => {
                                const newIndex = parseInt(e.target.value);
                                setSelectedExportProviderIndex(newIndex);
                                const newProvider =
                                    availableExportProviders[newIndex];
                                // Reset format to provider's default if current format not supported
                                if (
                                    !newProvider.supportedFormats.includes(
                                        selectedExportFormat
                                    )
                                ) {
                                    setSelectedExportFormat(
                                        newProvider.defaultFormat
                                    );
                                }
                            }}
                        >
                            {availableExportProviders.map((provider, index) => (
                                <option key={index} value={index}>
                                    {provider.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            color: "#aaa",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                        }}
                    >
                        Export Format:
                        <select
                            value={selectedExportFormat}
                            onChange={(e) =>
                                setSelectedExportFormat(
                                    e.target.value as ExportFormat
                                )
                            }
                        >
                            {exportProvider.supportedFormats.map((format) => (
                                <option key={format} value={format}>
                                    {format.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <p
                    style={{
                        margin: "0 0 1rem 0",
                        color: "#888",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                    }}
                >
                    {exportProvider.getDescription()}
                </p>

                <div className="json-preview-container">
                    {selectedExportFormat === "json" ? (
                        <JsonView
                            value={(() => {
                                try {
                                    return jsonPreview ? JSON.parse(jsonPreview) : {};
                                } catch (e) {
                                    console.error("Failed to parse JSON preview:", e);
                                    return {};
                                }
                            })()}
                            collapsed={1}
                            style={{
                                padding: "1rem",
                                background: "#ffffff",
                                fontSize: "0.9rem",
                                fontFamily: "'Courier New', Courier, monospace",
                            }}
                        />
                    ) : (
                        <pre className="json-preview">{jsonPreview}</pre>
                    )}
                </div>

                <div className="dialog-actions">
                    <Button onClick={copyToClipboard}>
                        <CopyIcon />{" "}
                        {isCopied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <Button onClick={downloadExport}>
                        <DownloadIcon /> Download{" "}
                        {selectedExportFormat.toUpperCase()}
                    </Button>
                    <Dialog.Close>
                        <Button aria-label="Close">Cancel</Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
