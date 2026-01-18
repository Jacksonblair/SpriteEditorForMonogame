import React, { useRef, useEffect, useCallback, useState } from "react";
import { useAtom } from "jotai";
import {
    appConfigAtom,
    spriteSheetsAtom,
    sourceImagesAtom,
    updateAnimationAtom,
    selectedAnimationIdAtom,
    selectedAnimationAtom,
    selectedSheetAtom,
    selectedSourceImageAtom,
} from "../state/store";
import type { SpriteSheetConfig, SpriteFrame } from "../types";
import { Button, Separator, Heading } from "@radix-ui/themes";
import { FrameSelector } from "./FrameSelector";
import "./AnimationPlaybackView.css";

interface AnimationPlaybackViewProps {}

export const AnimationPlaybackView: React.FC<
    AnimationPlaybackViewProps
> = ({}) => {
    const [, updateAnimation] = useAtom(updateAnimationAtom);
    const [selectedAnimationId] = useAtom(selectedAnimationIdAtom);
    const [selectedAnimation] = useAtom(selectedAnimationAtom);
    const [sheet] = useAtom(selectedSheetAtom);
    const [sourceImage] = useAtom(selectedSourceImageAtom);

    // Playback state managed internally
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const animationFrameRef = useRef<number>(0);
    const [config] = useAtom(appConfigAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [editedName, setEditedName] = React.useState(
        selectedAnimation?.name || "",
    );
    const imageRef = useRef<HTMLImageElement>(null);

    const onFrameRateChange = (rate: number) => {
        if (selectedAnimationId) {
            updateAnimation({
                id: selectedAnimationId,
                updates: { frameRate: rate },
            });
        }
    };

    const onNameChange = (newName: string) => {
        if (selectedAnimationId) {
            updateAnimation({
                id: selectedAnimationId,
                updates: { name: newName },
            });
        }
    };

    const handleNameSave = () => {
        if (!selectedAnimation) return;

        if (editedName.trim()) {
            onNameChange(editedName.trim());
        } else {
            setEditedName(selectedAnimation.name);
        }
        setIsEditingName(false);
    };

    // Animation playback loop
    useEffect(() => {
        if (!isPlaying || !selectedAnimation) return;

        const frames = selectedAnimation.frames;
        const frameDelay = 1000 / selectedAnimation.frameRate;
        let lastTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            if (currentTime - lastTime >= frameDelay) {
                setCurrentFrame((prev) => (prev + 1) % frames.length);
                lastTime = currentTime;
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, selectedAnimation?.frameRate, selectedAnimation?.frames]);

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
        [config.previewBackgroundType, config.previewBackgroundColor],
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

    // Draw current animation frame
    useEffect(() => {
        if (!sheet || !sourceImage || !imageRef.current || !selectedAnimation)
            return;

        const canvas = document.getElementById(
            "animationCanvas",
        ) as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imageRef.current;
        img.src = sourceImage.imageData;

        img.onload = () => {
            const frames = getSpriteFrames(sheet);
            const frameIndex = selectedAnimation.frames[currentFrame];
            const frame = frames[frameIndex];

            if (frame) {
                canvas.width = sheet.spriteWidth * 4;
                canvas.height = sheet.spriteHeight * 4;

                // Draw background
                drawBackground(ctx, canvas.width, canvas.height);

                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(
                    img,
                    frame.x,
                    frame.y,
                    frame.width,
                    frame.height,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
            }
        };
    }, [currentFrame, selectedAnimation, sheet, sourceImage, drawBackground]);

    if (!selectedAnimation)
        return (
            <>
                <div> No animation selected </div>
            </>
        );

    return (
        <>
            <img ref={imageRef} style={{ display: "none" }} alt="" />

            {/* Animation Configuration */}
            <div>
                <h2>Animation Configuration</h2>
                <div className="config-grid">
                    <label>
                        Name:
                        <input
                            type="text"
                            value={selectedAnimation.name}
                            onChange={(e) => onNameChange(e.target.value)}
                        />
                    </label>
                    <label>
                        Sprite Sheet:
                        <input
                            type="text"
                            value={sheet?.name || ""}
                            disabled
                            readOnly
                        />
                    </label>
                    <label>
                        Total Frames:
                        <input
                            type="number"
                            value={selectedAnimation.frames.length}
                            disabled
                            readOnly
                        />
                    </label>
                    <label>
                        Frame Rate (FPS):
                        <input
                            type="number"
                            value={selectedAnimation.frameRate}
                            onChange={(e) =>
                                onFrameRateChange(parseInt(e.target.value) || 1)
                            }
                            min="1"
                            max="60"
                        />
                    </label>
                    <label>
                        Duration (s):
                        <input
                            type="text"
                            value={(
                                selectedAnimation.frames.length /
                                selectedAnimation.frameRate
                            ).toFixed(2)}
                            disabled
                            readOnly
                        />
                    </label>
                    <label>
                        Frame Sequence:
                        <input
                            type="text"
                            value={`[${selectedAnimation.frames.join(", ")}]`}
                            disabled
                            readOnly
                        />
                    </label>
                </div>
            </div>

            {/* Animation Playback */}
            <div>
                <h2>Playback Preview</h2>
                <div className="animation-preview">
                    <canvas id="animationCanvas" />
                </div>
                <div className="playback-controls">
                    <Button onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={() => setCurrentFrame(0)}>Reset</Button>
                    <span>
                        Frame: {currentFrame + 1} /{" "}
                        {selectedAnimation.frames.length}
                        (Index: {selectedAnimation.frames[currentFrame]})
                    </span>
                </div>
            </div>

            <Separator size="4" my="4" />

            {/* Frame Selection */}
            {sheet && sourceImage && (
                <div>
                    <Heading>Edit Animation Frames</Heading>
                    <FrameSelector
                        sheet={sheet}
                        sourceImage={sourceImage}
                        selectedFrames={selectedAnimation.frames}
                        onFrameToggle={(frameIndex) => {
                            const currentFrames = selectedAnimation.frames;
                            let newFrames: number[];

                            if (currentFrames.includes(frameIndex)) {
                                newFrames = currentFrames.filter(
                                    (f) => f !== frameIndex,
                                );
                            } else {
                                newFrames = [...currentFrames, frameIndex];
                            }

                            if (selectedAnimationId) {
                                updateAnimation({
                                    id: selectedAnimationId,
                                    updates: { frames: newFrames },
                                });
                            }
                        }}
                        onSelectAll={() => {
                            if (!sheet || !selectedAnimationId) return;
                            const totalFrames = sheet.rows * sheet.columns;
                            const allFrames = Array.from(
                                { length: totalFrames },
                                (_, i) => i,
                            );
                            updateAnimation({
                                id: selectedAnimationId,
                                updates: { frames: allFrames },
                            });
                        }}
                        onClearSelection={() => {
                            if (!selectedAnimationId) return;
                            updateAnimation({
                                id: selectedAnimationId,
                                updates: { frames: [] },
                            });
                        }}
                        allowFrameOrdering={true}
                        onFramesReorder={(newFrames) => {
                            if (selectedAnimationId) {
                                updateAnimation({
                                    id: selectedAnimationId,
                                    updates: { frames: newFrames },
                                });
                            }
                        }}
                    />
                </div>
            )}
        </>
    );
};
