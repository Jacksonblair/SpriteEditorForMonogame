import React, { useState } from "react";
import { Button, Heading } from "@radix-ui/themes";
import {
    addAnimationAtom,
    selectedFramesAtom,
    selectedSheetIdAtom,
} from "../state/store";
import { useAtom } from "jotai";
import type { Animation } from "../types";

interface AnimationCreatorViewProps {}

export const AnimationCreatorView: React.FC<
    AnimationCreatorViewProps
> = ({}) => {
    const [animationName, setAnimationName] = useState<string>();
    const [selectedFrames, setSelectedFrames] = useAtom(selectedFramesAtom);
    const [selectedSheetId] = useAtom(selectedSheetIdAtom);
    const [, addAnimation] = useAtom(addAnimationAtom);

    // Create new animation
    const createAnimation = () => {
        if (!animationName || !selectedSheetId || selectedFrames.length === 0)
            return;

        const newAnimation: Animation = {
            id: Date.now().toString(),
            name: animationName,
            spriteSheetId: selectedSheetId,
            frames: [...selectedFrames],
            frameRate: 10,
        };

        addAnimation(newAnimation);
        setAnimationName("");
        setSelectedFrames([]);
    };

    return (
        <section className="section">
            <Heading>Create Animation</Heading>
            <div className="animation-creator">
                <input
                    type="text"
                    placeholder="Animation name"
                    value={animationName}
                    onChange={(e) => setAnimationName(e.target.value)}
                />
                <Button
                    onClick={createAnimation}
                    disabled={!animationName || selectedFrames.length === 0}
                >
                    Create Animation
                </Button>
            </div>
            {selectedFrames.length > 0 && (
                <div className="selected-frames">
                    Selected frames: [{selectedFrames.join(", ")}]
                </div>
            )}
        </section>
    );
};
