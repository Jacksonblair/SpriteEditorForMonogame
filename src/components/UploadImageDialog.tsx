import React, { useState } from "react";
import { useAtom } from "jotai";
import { Dialog, Button, Flex, Text } from "@radix-ui/themes";
import { uploadImageFileAtom } from "../state/store";

interface UploadImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UploadImageDialog: React.FC<UploadImageDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const [, uploadImageFile] = useAtom(uploadImageFileAtom);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        await uploadImageFile(selectedFile);
        
        // Reset and close
        setSelectedFile(null);
        setPreviewUrl(null);
        onOpenChange(false);
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>Upload Image</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Select an image file to add to your project
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Choose Image
                        </Text>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid var(--gray-7)",
                                borderRadius: "4px",
                            }}
                        />
                    </label>

                    {previewUrl && (
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="bold">
                                Preview:
                            </Text>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "300px",
                                    objectFit: "contain",
                                    border: "1px solid var(--gray-7)",
                                    borderRadius: "4px",
                                }}
                            />
                            <Text size="1" color="gray">
                                {selectedFile?.name}
                            </Text>
                        </Flex>
                    )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button onClick={handleSubmit} disabled={!selectedFile}>
                        Upload
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
