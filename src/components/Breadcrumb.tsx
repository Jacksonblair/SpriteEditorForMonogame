import React from "react";
import { useAtom } from "jotai";
import {
    sourceImagesAtom,
    spriteSheetsAtom,
    animationsAtom,
    selectedImageIdAtom,
    selectedSheetIdAtom,
    selectedAnimationIdAtom,
    navigateToImageAtom,
    navigateToSheetAtom,
} from "../state/store";
import "./Breadcrumb.css";

export const Breadcrumb: React.FC = () => {
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [animations] = useAtom(animationsAtom);
    const [selectedImageId] = useAtom(selectedImageIdAtom);
    const [selectedSheetId] = useAtom(selectedSheetIdAtom);
    const [selectedAnimationId] = useAtom(selectedAnimationIdAtom);
    const [, navigateToImage] = useAtom(navigateToImageAtom);
    const [, navigateToSheet] = useAtom(navigateToSheetAtom);

    // Get the selected items
    const selectedAnimation = animations.find(
        (a) => a.id === selectedAnimationId
    );
    
    // Derive the sheet - either from selectedSheetId or from the animation's spriteSheetId
    let selectedSheet = spriteSheets.find((s) => s.id === selectedSheetId);
    if (!selectedSheet && selectedAnimation) {
        selectedSheet = spriteSheets.find(
            (s) => s.id === selectedAnimation.spriteSheetId
        );
    }
    
    const selectedImage = sourceImages.find((img) => img.id === selectedImageId);

    // Determine the image based on the selection hierarchy
    let breadcrumbImage = selectedImage;
    if (!breadcrumbImage && selectedSheet) {
        breadcrumbImage = sourceImages.find(
            (img) => img.id === selectedSheet.sourceImageId
        );
    }

    // Build breadcrumb items
    const breadcrumbItems: Array<{
        name: string;
        onClick: () => void;
        isLast: boolean;
    }> = [];

    // Add image to breadcrumb if we have one
    if (breadcrumbImage) {
        breadcrumbItems.push({
            name: breadcrumbImage.name,
            onClick: () => navigateToImage(breadcrumbImage.id),
            isLast: !selectedSheet && !selectedAnimation,
        });
    }

    // Add sheet to breadcrumb if we have one
    if (selectedSheet) {
        breadcrumbItems.push({
            name: selectedSheet.name,
            onClick: () => navigateToSheet(selectedSheet.id),
            isLast: !selectedAnimation,
        });
    }

    // Add animation to breadcrumb if we have one
    if (selectedAnimation) {
        breadcrumbItems.push({
            name: selectedAnimation.name,
            onClick: () => {}, // Last item, no navigation
            isLast: true,
        });
    }

    // Don't render if there's nothing to show
    if (breadcrumbItems.length === 0) {
        return null;
    }

    return (
        <div className="breadcrumb">
            {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}
                    {item.isLast ? (
                        <span className="breadcrumb-item breadcrumb-current">
                            {item.name}
                        </span>
                    ) : (
                        <a
                            className="breadcrumb-item breadcrumb-link"
                            onClick={item.onClick}
                        >
                            {item.name}
                        </a>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
