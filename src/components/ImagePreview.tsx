import React from "react";
import type { SourceImage } from "../types";
import { Button } from "@radix-ui/themes";

interface ImagePreviewProps {
    image: SourceImage;
    onCreateSpriteSheet: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    image,
    onCreateSpriteSheet,
}) => {
    return (
        <>
            <div className="canvas-container" style={{ textAlign: "center" }}>
                <img
                    src={image.imageData}
                    alt={image.name}
                    style={{
                        maxWidth: "100%",
                        height: "auto",
                        imageRendering: "pixelated",
                        border: "2px solid #444",
                        borderRadius: "4px",
                    }}
                />
            </div>
            <div
                style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button onClick={onCreateSpriteSheet}>
                    + Create Sprite Sheet from This Image
                </Button>
            </div>
        </>
    );
};
