import React, { useState } from "react";
import "./Sidebar.css";
import { Box, Button, Heading, Flex } from "@radix-ui/themes";
import { TreeView } from "./TreeView/TreeView";
import { UploadImageDialog } from "./UploadImageDialog";
import { FilePlusIcon, PlusIcon } from "@radix-ui/react-icons";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = ({}) => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    return (
        <div className="sidebar">
            <UploadImageDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
            />

            <Box>
                <Flex direction="column" gap="3">
                    <Heading size="4">Project</Heading>
                    <Button
                        size="1"
                        onClick={() => setUploadDialogOpen(true)}
                        style={{ width: "100%" }}
                    >
                        Upload Image
                        <FilePlusIcon />
                    </Button>
                </Flex>
            </Box>

            <TreeView />
        </div>
    );
};
