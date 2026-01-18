import React from "react";
import { useAtom } from "jotai";
import {
    selectedFramesAtom,
    selectedSheetAtom,
    selectedSourceImageAtom,
} from "../state/store";
import { Heading } from "@radix-ui/themes";
import { FrameSelector } from "./FrameSelector";
import "./SpriteFramesView.css";

interface SpriteFramesViewProps {}

export const SpriteFramesView: React.FC<SpriteFramesViewProps> = () => {
    const [selectedFrames, setSelectedFrames] = useAtom(selectedFramesAtom);
    const [selectedSheet] = useAtom(selectedSheetAtom);
    const [sourceImage] = useAtom(selectedSourceImageAtom);

    // Select all frames
    const selectAllFrames = () => {
        if (!selectedSheet) return;
        const totalFrames = selectedSheet.rows * selectedSheet.columns;
        setSelectedFrames(Array.from({ length: totalFrames }, (_, i) => i));
    };

    // Toggle frame selection (no auto-sort - maintain click order)
    const toggleFrameSelection = (frameIndex: number) => {
        if (selectedFrames.includes(frameIndex)) {
            setSelectedFrames(selectedFrames.filter((f) => f !== frameIndex));
        } else {
            setSelectedFrames([...selectedFrames, frameIndex]);
        }
    };

    if (!selectedSheet || !sourceImage) return null;

    return (
        <div>
            <Heading>Sprite Frames</Heading>
            <FrameSelector
                sheet={selectedSheet}
                sourceImage={sourceImage}
                selectedFrames={selectedFrames}
                onFrameToggle={toggleFrameSelection}
                onSelectAll={selectAllFrames}
                onClearSelection={() => setSelectedFrames([])}
            />
        </div>
    );
};
