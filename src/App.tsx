import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { SettingsDialog } from "./components/SettingsDialog";
import { ExportDialog } from "./components/ExportDialog";
import { SpriteSheetConfigPanel } from "./components/SpriteSheetConfig";
import { SpriteFramesView } from "./components/SpriteFramesView";
import { AnimationCreatorView } from "./components/AnimationCreatorView";
import { AnimationPlaybackView } from "./components/AnimationPlaybackView";
import { useAtom } from "jotai";
import {
    animationsAtom,
    sourceImagesAtom,
    spriteSheetsAtom,
    selectedImageIdAtom,
    selectedSheetIdAtom,
    selectedAnimationIdAtom,
    createSheetFromImageAtom,
    selectedSourceImageAtom,
} from "./state/store";
import { Button, Card, Flex, Heading, Separator } from "@radix-ui/themes";
import { Header } from "@radix-ui/themes/components/table";
import { MenuBar } from "./components/MenuBar/MenuBar";
import { Breadcrumb } from "./components/Breadcrumb";

function App() {
    // Jotai state (read-only)
    const [sourceImages] = useAtom(sourceImagesAtom);
    const [spriteSheets] = useAtom(spriteSheetsAtom);
    const [animations] = useAtom(animationsAtom);
    const [selectedSheetId, setSelectedSheetId] = useAtom(selectedSheetIdAtom);
    const [selectedAnimationId, setSelectedAnimationId] = useAtom(
        selectedAnimationIdAtom,
    );
    const [selectedImageId, setSelectedImageId] = useAtom(selectedImageIdAtom);

    // Mutator atoms (write-only)
    const [, createSheetFromImage] = useAtom(createSheetFromImageAtom);
    const [selectedSourceImage] = useAtom(selectedSourceImageAtom);

    const selectedSheet = spriteSheets.find((s) => s.id === selectedSheetId);
    const selectedAnimation = animations.find(
        (a) => a.id === selectedAnimationId,
    );
    const selectedImage = sourceImages.find(
        (img) => img.id === selectedImageId,
    );

    // Create sprite sheet from selected image
    const createSheetFromSelectedImage = () => {
        if (!selectedImage) return;
        createSheetFromImage(selectedImage);
    };

    return (
        <div className="app">
            <SettingsDialog />

            <ExportDialog />

            <MenuBar />

            <Flex p="2" gap={"2"}>
                <Card style={{ minWidth: "250px", maxWidth: "250px" }}>
                    <Flex>
                        <Sidebar />
                    </Flex>
                </Card>
                <Card
                    style={{
                        minWidth: "0",
                        flexGrow: "1",
                    }}
                >
                    <Flex direction={"column"}>
                        {/* Breadcrumb navigation */}
                        <Breadcrumb />

                        {/* Show image preview when image is selected */}
                        {selectedImage && !selectedSheet && (
                            <>
                                <Header>
                                    Image Preview: {selectedImage.name}
                                </Header>
                                <div
                                    className="canvas-container"
                                    style={{ textAlign: "center" }}
                                >
                                    <img
                                        src={selectedImage.imageData}
                                        alt={selectedImage.name}
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
                                    <Button
                                        onClick={createSheetFromSelectedImage}
                                    >
                                        + Create Sprite Sheet from This Image
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Show sprite sheet configuration and frames when sprite sheet is selected */}
                        {selectedSheet && !selectedAnimationId && (
                            <>
                                {/* Configuration Panel */}
                                <div>
                                    <Heading>
                                        Sprite Sheet Configuration
                                    </Heading>
                                    <SpriteSheetConfigPanel />
                                </div>

                                <Separator size="4" my="4" />

                                {/* Sprite Frames */}
                                {selectedSourceImage && <SpriteFramesView />}

                                <Separator size="4" my="4" />

                                {/* Animation Creator */}
                                <AnimationCreatorView />
                            </>
                        )}

                        {/* Show animation preview when animation is selected */}
                        {selectedAnimation && <AnimationPlaybackView />}

                        {!selectedImage &&
                            !selectedSheet &&
                            !selectedAnimation && (
                                <div className="empty-state">
                                    <h2>Welcome to MonoGame Sprite Editor</h2>
                                    <p>Upload a sprite sheet to get started</p>
                                </div>
                            )}
                    </Flex>
                </Card>
            </Flex>
        </div>
    );
}

export default App;
