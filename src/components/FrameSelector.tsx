import React, { useRef, useEffect, useCallback, useState } from "react";
import { useAtom } from "jotai";
import { appConfigAtom } from "../state/store";
import type { SpriteSheetConfig, SourceImage, SpriteFrame } from "../types";
import { Button } from "@radix-ui/themes";

interface FrameSelectorProps {
    sheet: SpriteSheetConfig;
    sourceImage: SourceImage;
    selectedFrames: number[];
    onFrameToggle: (frameIndex: number) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    showControls?: boolean;
    allowFrameOrdering?: boolean;
    onFramesReorder?: (newFrames: number[]) => void;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
    sheet,
    sourceImage,
    selectedFrames,
    onFrameToggle,
    onSelectAll,
    onClearSelection,
    showControls = true,
    allowFrameOrdering = false,
    onFramesReorder,
}) => {
    const [config] = useAtom(appConfigAtom);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameOrderCanvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [selectedSequenceIndex, setSelectedSequenceIndex] = useState<
        number | null
    >(null);

    // Draw background pattern
    const drawBackground = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            if (config.previewBackgroundType === "checkerboard") {
                const squareSize = 10;
                const color1 = "#cccccc";
                const color2 = "#999999";

                for (let y = 0; y < height; y += squareSize) {
                    for (let x = 0; x < width; x += squareSize) {
                        const isEven =
                            (Math.floor(x / squareSize) +
                                Math.floor(y / squareSize)) %
                                2 ===
                            0;
                        ctx.fillStyle = isEven ? color1 : color2;
                        ctx.fillRect(x, y, squareSize, squareSize);
                    }
                }
            } else {
                ctx.fillStyle = config.previewBackgroundColor;
                ctx.fillRect(0, 0, width, height);
            }
        },
        [config.previewBackgroundType, config.previewBackgroundColor]
    );

    // Calculate sprite positions
    const getSpriteFrames = (sheetConfig: SpriteSheetConfig): SpriteFrame[] => {
        const frames: SpriteFrame[] = [];
        for (let row = 0; row < sheetConfig.rows; row++) {
            for (let col = 0; col < sheetConfig.columns; col++) {
                frames.push({
                    x:
                        sheetConfig.offsetX +
                        col * (sheetConfig.spriteWidth + sheetConfig.spacingX),
                    y:
                        sheetConfig.offsetY +
                        row * (sheetConfig.spriteHeight + sheetConfig.spacingY),
                    width: sheetConfig.spriteWidth,
                    height: sheetConfig.spriteHeight,
                });
            }
        }
        return frames;
    };

    // Draw sprites on canvas
    useEffect(() => {
        if (!canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imageRef.current;
        img.src = sourceImage.imageData;

        img.onload = () => {
            const frames = getSpriteFrames(sheet);
            const padding = 10;
            const frameNumberHeight = 12;

            // Calculate canvas dimensions based on grid layout
            const totalWidth = sheet.columns * (sheet.spriteWidth + padding);
            const totalHeight =
                sheet.rows * (sheet.spriteHeight + padding) + frameNumberHeight;

            canvas.width = totalWidth;
            canvas.height = totalHeight;

            // Draw background
            drawBackground(ctx, canvas.width, canvas.height);

            frames.forEach((frame, index) => {
                // Calculate grid position
                const col = index % sheet.columns;
                const row = Math.floor(index / sheet.columns);
                const x = col * (sheet.spriteWidth + padding);
                const y =
                    row * (sheet.spriteHeight + padding) + frameNumberHeight;

                ctx.drawImage(
                    img,
                    frame.x,
                    frame.y,
                    frame.width,
                    frame.height,
                    x,
                    y,
                    sheet.spriteWidth,
                    sheet.spriteHeight
                );

                // Draw frame boundary outline
                ctx.strokeStyle = "#666";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, sheet.spriteWidth, sheet.spriteHeight);

                // Draw frame number with dark background for readability
                const frameText = index.toString();
                ctx.font = "10px monospace";
                const textWidth = ctx.measureText(frameText).width;

                // Draw dark background behind text
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(x, y - 12, textWidth + 4, 12);

                // Draw frame number
                ctx.fillStyle = "#00ff00";
                ctx.fillText(frameText, x + 2, y - 2);

                // Highlight selected frames with thicker border
                if (selectedFrames.includes(index)) {
                    ctx.strokeStyle = "#00ff00";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, sheet.spriteWidth, sheet.spriteHeight);
                }
            });
        };
    }, [sheet, sourceImage, selectedFrames, drawBackground]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const padding = 10;
        const frameNumberHeight = 12;
        const frameWidth = sheet.spriteWidth + padding;
        const frameHeight = sheet.spriteHeight + padding;

        // Calculate which grid cell was clicked
        const col = Math.floor(x / frameWidth);
        const row = Math.floor((y - frameNumberHeight) / frameHeight);

        // Calculate frame index from grid position
        const frameIndex = row * sheet.columns + col;
        const totalFrames = sheet.rows * sheet.columns;

        if (
            frameIndex >= 0 &&
            frameIndex < totalFrames &&
            col < sheet.columns &&
            row < sheet.rows
        ) {
            onFrameToggle(frameIndex);
        }
    };

    // Drag-and-drop handlers for frame reordering
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newFrames = [...selectedFrames];
        const [draggedFrame] = newFrames.splice(draggedIndex, 1);
        newFrames.splice(dropIndex, 0, draggedFrame);

        onFramesReorder?.(newFrames);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const frames = getSpriteFrames(sheet);

    // Draw frame order canvas
    useEffect(() => {
        if (!frameOrderCanvasRef.current || !imageRef.current || selectedFrames.length === 0) return;

        const canvas = frameOrderCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imageRef.current;
        if (!img.complete) return;

        const gap = 15;
        const frameNumberHeight = 12;

        // Calculate canvas dimensions
        const totalWidth = selectedFrames.length * (sheet.spriteWidth + gap) - gap;
        const totalHeight = sheet.spriteHeight + frameNumberHeight;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Draw background
        drawBackground(ctx, canvas.width, canvas.height);

        selectedFrames.forEach((frameIndex, sequenceIndex) => {
            const frame = frames[frameIndex];
            if (!frame) return;

            const x = sequenceIndex * (sheet.spriteWidth + gap);

            // Draw sprite
            ctx.drawImage(
                img,
                frame.x,
                frame.y,
                frame.width,
                frame.height,
                x,
                frameNumberHeight,
                sheet.spriteWidth,
                sheet.spriteHeight
            );

            // Draw text with background
            const frameText = `${sequenceIndex} (frame #${frameIndex})`;
            ctx.font = "10px monospace";
            const textWidth = ctx.measureText(frameText).width;
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(x, 0, textWidth + 4, 12);
            ctx.fillStyle = "#00ff00";
            ctx.fillText(frameText, x + 2, 10);

            // Draw border
            ctx.strokeStyle = selectedSequenceIndex === sequenceIndex ? "#00ff00" : "#666";
            ctx.lineWidth = selectedSequenceIndex === sequenceIndex ? 2 : 1;
            ctx.strokeRect(x, frameNumberHeight, sheet.spriteWidth, sheet.spriteHeight);

            // Drag feedback
            if (draggedIndex === sequenceIndex) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fillRect(x, frameNumberHeight, sheet.spriteWidth, sheet.spriteHeight);
            }
        });
    }, [selectedFrames, sheet, frames, drawBackground, selectedSequenceIndex, draggedIndex]);

    // Always show both views
    return (
        <div>
            {/* Frame Order Editor (shown when allowFrameOrdering is true) */}
            {allowFrameOrdering && (
                <div style={{ marginTop: "1rem" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <p className="info" style={{ margin: 0 }}>
                            Frame Sequence - Drag to reorder
                        </p>
                        {selectedFrames.length > 0 && (
                            <Button
                                size="1"
                                variant="soft"
                                onClick={() => {
                                    const sorted = [...selectedFrames].sort(
                                        (a, b) => a - b
                                    );
                                    onFramesReorder?.(sorted);
                                    setSelectedSequenceIndex(null);
                                }}
                            >
                                Sort by Frame Index
                            </Button>
                        )}
                        {selectedSequenceIndex !== null &&
                            selectedFrames.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.85rem",
                                            color: "#aaa",
                                        }}
                                    >
                                        Move to position:
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedFrames.length - 1}
                                            value={selectedSequenceIndex}
                                            onChange={(e) => {
                                                const newPos = parseInt(
                                                    e.target.value
                                                );
                                                if (
                                                    isNaN(newPos) ||
                                                    newPos < 0 ||
                                                    newPos >=
                                                        selectedFrames.length
                                                )
                                                    return;

                                                const newFrames = [
                                                    ...selectedFrames,
                                                ];
                                                const [movedFrame] =
                                                    newFrames.splice(
                                                        selectedSequenceIndex,
                                                        1
                                                    );
                                                newFrames.splice(
                                                    newPos,
                                                    0,
                                                    movedFrame
                                                );

                                                onFramesReorder?.(newFrames);
                                                setSelectedSequenceIndex(
                                                    newPos
                                                );
                                            }}
                                            style={{
                                                marginLeft: "0.5rem",
                                                width: "60px",
                                                padding: "0.25rem",
                                            }}
                                        />
                                    </label>
                                    <Button
                                        size="1"
                                        variant="ghost"
                                        onClick={() =>
                                            setSelectedSequenceIndex(null)
                                        }
                                    >
                                        ✕
                                    </Button>
                                </div>
                            )}
                    </div>
                    <div
                        style={{
                            overflowX: "auto",
                            minHeight: "80px",
                        }}
                    >
                        {selectedFrames.length === 0 ? (
                            <div
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                    color: "#666",
                                    padding: "2rem",
                                    fontStyle: "italic",
                                }}
                            >
                                No frames selected. Click frames below to add
                                them to the sequence.
                            </div>
                        ) : (
                            <canvas
                                ref={frameOrderCanvasRef}
                                onClick={(e) => {
                                    if (!frameOrderCanvasRef.current) return;
                                    const rect = frameOrderCanvasRef.current.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const gap = 15;
                                    const frameWidth = sheet.spriteWidth + gap;
                                    const clickedIndex = Math.floor(x / frameWidth);
                                    
                                    if (clickedIndex >= 0 && clickedIndex < selectedFrames.length) {
                                        setSelectedSequenceIndex(clickedIndex);
                                    }
                                }}
                                style={{
                                    imageRendering: "pixelated",
                                    cursor: "pointer",
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            <img ref={imageRef} style={{ display: "none" }} alt="" />
            <p className="info">
                Click on frames in the preview below to select them
            </p>
            {showControls && (
                <div className="frame-controls">
                    <Button onClick={onSelectAll}>Select All</Button>
                    <Button onClick={onClearSelection}>Clear Selection</Button>
                    <span>Selected: {selectedFrames.length} frames</span>
                </div>
            )}
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{ cursor: "pointer" }}
                />
            </div>
        </div>
    );
};
