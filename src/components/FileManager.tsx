import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, ListGroup, Container, Modal } from "react-bootstrap";

import { api, API_URL } from '../services/AuthService';
import { toast } from "../services/api";

const FileManager = () => {
    const [files, setFiles] = useState([]);

    const [fileSizes, setFileSizes] = useState({});
    const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 0, available: 0 });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchFiles();
        fetchUserStorage();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await api.get("/files" //, {
                // headers: { Authorization: `Bearer ${token}` }
                // }
            );
            setFiles(response.data);
            fetchFileSizes(response.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    // Fetch storage info
    const fetchStorageInfo = async () => {
        try {
            const res = await api.get("http://localhost:3000/storage");
            setStorageInfo(res.data);
        } catch (error) {
            console.error("Error fetching storage info", error);
        }
    };

    const fetchUserStorage = async () => {
        try {
            const res = await api.get(`${API_URL}/user/storage`
                // "http://localhost:3000/user/storage"
                // , {
                // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                // }
            );
            setStorageInfo(res.data);
        } catch (error) {
            console.error("Error fetching user storage info", error);
        }
    };


    // Fetch file sizes
    const fetchFileSizes = async (files: any) => {
        let sizes: { [key: string]: string } = {};
        for (const file of files) {
            try {
                const res = await api.get(`${API_URL}/filesize/${file}`
                    // `http://localhost:3000/filesize/${file}`
                );
                sizes[file] = res.data.size;
            } catch (error) {
                console.error(`Error fetching size for ${file}`, error);
                sizes[file] = "Unknown";
            }
        }
        setFileSizes(sizes);
    };

    const handleFileUpload = async (e: any) => {
        e.preventDefault();
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await api.post("/upload", formData
                // , {
                // headers: { Authorization: `Bearer ${token}` }
                // }
            );
            setSelectedFile(null);
            fetchFiles();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            const response = await api.get(`/files/${filename}`
                // , {
                // headers: { Authorization: `Bearer ${token}` },
                // responseType: "blob",
                // }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleDelete = async (filename: string) => {
        try {
            await api.delete(`/files/${filename}`
                // , {
                // headers: { Authorization: `Bearer ${token}` }
                // }
            );
            fetchFiles();
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const viewFile = async (filename: string) => {
        try {
            const res = await axios.get(`${API_URL}/files/${filename}`
                // `http://10.0.0.202:3000/files/${filename}`
                , {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    responseType: "blob"
                });

            const fileType = res.data.type; // Get MIME type
            const reader = new FileReader();

            reader.onload = () => {
                let content: React.ReactNode; // Explicitly type content for React rendering

                if (typeof reader.result === "string") {
                    if (fileType.startsWith("text") || fileType === "application/json") {
                        content = <pre style={{ whiteSpace: "pre-wrap" }}>{reader.result}</pre>;
                    } else if (fileType.startsWith("image")) {
                        content = <img src={reader.result} alt="Preview" style={{ maxWidth: "100%" }} />;
                    } else {
                        content = (
                            <a href={reader.result} download={filename}>
                                Download {filename}
                            </a>
                        );
                    }
                } else {
                    content = <p>Unsupported file format.</p>; // Handles unexpected ArrayBuffer case
                }

                setFileContent(content as unknown as string);
                setSelectedFileName(filename);
                setShowModal(true);
            };

            if (fileType.startsWith("text") || fileType === "application/json") {
                reader.readAsText(res.data);
            } else {
                reader.readAsDataURL(res.data);
            }
            // toast(" Success", "ok");
        } catch (error) {
            console.error("Error loading file", error);
        }
    };

    return (
        <Container className="mt-4">
            <h2>File Manager</h2>
            {/* Storage Info */}
            <div className="sticky-bottom alert alert-info">
                <strong>Total Storage:</strong> {Math.round(storageInfo.limit / 1e6)} MB |
                <strong> Available:</strong> {Math.round(storageInfo.available / 1e6)} MB |
                <strong> Used:</strong> {Math.round(storageInfo.used / 1e6)} MB
            </div>
            <Form onSubmit={handleFileUpload} className="mb-3">
                <Form.Group>
                    <Form.Control
                        type="file"
                        onChange={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.files) {
                                setSelectedFile(target.files[0])
                            }
                        }
                        }
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-2">Upload</Button>
            </Form>
            {/* <ListGroup> */}
            <div className="row border-bottom py-2 align-items-center">
                <div className="col-4">Name</div>
                <div className="col-3">Size</div>
                <div className="col-4">Actions</div>
            </div>
            {files.map((file, index) => (
                <div key={index} className="row border-bottom py-2 align-items-center">
                    {/* <ListGroup.Item key={index}> */}

                    <div className="col-4">{file}</div>
                    <div className="col-3"><small>({fileSizes[file] ? `${fileSizes[file]} bytes` : "Unknown"})</small></div>
                    <div className="col-4">
                        <Button variant="primary" size="sm" onClick={() => viewFile(file)}>
                            View
                        </Button>
                        <Button variant="success" size="sm" className="ms-2" onClick={() => handleDownload(file)}>
                            Download
                        </Button>
                        <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(file)}>
                            Delete
                        </Button>
                    </div>
                    {/* </ListGroup.Item> */}

                </div>
            ))}
            {/* </ListGroup> */}
            {/* File Viewer Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Viewing: {selectedFile?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fileContent ? (
                        <pre style={{ whiteSpace: "pre-wrap" }}>{fileContent as unknown as string}</pre>
                    ) : (
                        <p>Unable to display file content.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container >
    );
};

export default FileManager;
