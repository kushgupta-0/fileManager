"use client";
import { useState, useEffect } from "react";
import useFileStore from "../context/FileContext";
import { useDrop } from "react-dnd";
import DraggableFile from "./DraggableFile";
import { Breadcrumbs, Container, Paper, List, Link, Button, TextField } from "@mui/material";

export default function FileTree() {
    const { files, fetchFiles, createFile, moveFile, currentFolderId, setCurrentFolder } = useFileStore();
    const [newFileName, setNewFileName] = useState("");
    const [fileType, setFileType] = useState("folder");
    const [path, setPath] = useState([{ id: null, name: "Home" }]);
    const [folderHistory, setFolderHistory] = useState([{ id: null, name: "Home" }]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const visibleFiles = files.filter(file => file.parentId === (currentFolderId === "Home" ? null : currentFolderId));

    const navigateToFolder = (folderId, folderName) => {
        if (!folderId) {
            console.error("Tried to navigate to a null folderId");
            return;
        }
        setCurrentFolder(folderId);
        setPath([...path, { id: folderId, name: folderName }]);
        setFolderHistory([...folderHistory, { id: folderId, name: folderName }]);

    };

    const [, drop] = useDrop({
        accept: "FILE",
        drop: async (item, monitor) => {
            const dropTarget = monitor.getDropResult();
            if (!dropTarget || !dropTarget.folderId) {
                console.error("Invalid drop target: folderId is null");
                return;
            }
            if (item.id !== dropTarget.folderId) {
                await moveFile(item.id, dropTarget.folderId);
            }
        },
    });

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            let fileName = newFileName.trim();
            if (fileType === "file" && !fileName.includes(".")) {
                fileName += ".txt";
            }
            createFile(fileName, fileType, currentFolderId);
            setNewFileName("");
        }
    };

    const navigateTo = (index) => {
        const newPath = path.slice(0, index + 1);
        setPath(newPath);
        setCurrentFolder(newPath[newPath.length - 1].id || "root");
    };

    const goBack = () => {
        if (folderHistory.length > 1) {
            const newHistory = folderHistory.slice(0, -1);
            setFolderHistory(newHistory);
            setCurrentFolder(newHistory[newHistory.length - 1].id || "root");
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 3, backgroundColor: "#fff59d", padding: 3, borderRadius: 2 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#fff59d", borderRadius: 2 }}>

                {/* Back Button (only shown if inside a folder) */}
                {folderHistory.length > 1 && (
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "#ffca28", color: "black", mb: 2 }}
                        onClick={goBack}
                    >
                        🔙 Back
                    </Button>
                )}

                {/* File Creation */}
                <div className="flex gap-2 mb-4 mt-2">
                    <TextField
                        label="New File/Folder Name"
                        variant="outlined"
                        size="small"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        sx={{ backgroundColor: "white", borderRadius: 1 }}
                    />
                    <Button
                        variant={fileType === "folder" ? "contained" : "outlined"}
                        onClick={() => setFileType("folder")}
                        sx={{ backgroundColor: fileType === "folder" ? "#fbc02d" : "white", color: "black" }}
                    >
                        Create Folder
                    </Button>
                    <Button
                        variant={fileType === "file" ? "contained" : "outlined"}
                        onClick={() => setFileType("file")}
                        sx={{ backgroundColor: fileType === "file" ? "#fbc02d" : "white", color: "black" }}
                    >
                        Create File
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateFile}
                        sx={{ backgroundColor: "#ffca28", color: "black", marginLeft: "auto" }}
                    >
                        Create
                    </Button>
                </div>

                <List>
                    {visibleFiles.map((file) => (
                        <DraggableFile
                            key={file._id}
                            file={file}
                            navigateToFolder={navigateToFolder}
                            moveFile={moveFile}
                        />
                    ))}
                </List>
            </Paper>
        </Container>
    );
}