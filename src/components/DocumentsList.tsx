import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocuments, toast, DocumentType, createDocument, deleteDocument } from "../services/api";
import { Button, Form, Modal } from "react-bootstrap";

type FieldType = "string" | "number" | "boolean" | "array" | "object";

// interface DocumentType {
//     [key: string]: any;
// }

export const DocumentsList = () => {
    const { collectionName } = useParams<{ collectionName: string }>();
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});

    const [showAddDocument, setShowAddDocument] = useState(false);

    const [newDocumentName, setNewDocumentName] = useState("");

    const [fetchDocs, setFetchDocs] = useState(true)
    const navigate = useNavigate();

    //
    // React Hook to monitor documents list
    //
    useEffect(() => {
        if (!fetchDocs) return;
        fetchDocuments();
    }, [fetchDocs, collectionName]);

    const fetchDocuments = async () => {
        try {
            // const res = await axios.get(`http://localhost:5000/collections/${collectionName}`);
            // setDocuments(res.data);
            const data = await getDocuments(collectionName!);
            setDocuments(data);
            setFetchDocs(false)
        } catch (error) {
            console.error("Error fetching documents", error);
            toast("Error fetching documents", "error");
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!window.confirm(`Are you sure you want to delete "${docId}"?`)) return;
        try {
            await deleteDocument(collectionName!, docId);
            toast(`Document "${docId}" deleted successfully!`, "ok");
            // alert(`Document "${docId}" deleted successfully!`);
            setFetchDocs(true); // Refresh list
        } catch (err) {
            // setError(`Failed to delete document "${docId}"`);
            console.error(err);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <h2>Documents</h2>
                <div className="card mt-lg-5 mb-lg-3 mx-lg-5 shadow-lg">
                    <div className="card-header">
                        <div className="d-flex justify-content-between">
                            <h5>Collection : {collectionName}</h5>
                            <div className="justify-content-end">
                                <Button className="btn btn-success btn-sm" onClick={() => {
                                    // window.history.back();
                                    setShowAddDocument(true)
                                }}>Add</Button>

                                <Button className="btn btn-primary btn-sm" onClick={() => {
                                    window.history.back();
                                }}>Back</Button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">List of User Documents are listed Below</div>
                </div>
                <br />

                {/* <div className="card"> */}
                {/* <div className="card-header"> */}

                {/* </div> */}
                <ul className="list-group px-5">
                    {Object.entries(documents).map(([docId, doc], index) => (
                        <>

                            <li
                                key={docId}
                                className="list-group-item d-flex justify-content-between align-items-center shadow-sm"
                            >
                                <span
                                    className="clickable"
                                    onClick={() => navigate(`/${collectionName}/document/${docId}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {docId}
                                </span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteDocument(docId)}
                                >
                                    ✕
                                </button>
                            </li>

                            {/* <br /> */}
                        </>
                    ))}
                </ul>
                {/* </div> */}
            </div>

            {showAddDocument && (
                <Modal show={showAddDocument} onHide={() => setShowAddDocument(false)}>
                    <Modal.Header closeButton>

                        <Modal.Title>Add Document</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Document Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button className="btn btn-success btn-sm" onClick={() => {
                            if (newDocumentName === "") {
                                alert("Now name entered");
                                setShowAddDocument(false);
                                return
                            }
                            createDocument(collectionName!, newDocumentName, {})
                            setNewDocumentName("")
                            setFetchDocs(true)
                            setShowAddDocument(false)
                            toast("Document created successfully", "ok")
                        }}>Add</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { getDocuments } from "../services/api";
// // import { getDocuments, toast } from "../services/api";

// interface DocumentListProps {
//     collectionPath: string; // e.g. "users", "users/abc/posts"
// }

// const DocumentsList: React.FC<DocumentListProps> = ({ collectionPath }) => {
//     const [documents, setDocuments] = useState<string[]>([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchDocuments = async () => {
//             try {
//                 const data = await getDocuments(collectionPath!);
//                 // const res = await axios.get(`/api/collections/${collectionPath}`, {
//                 //     headers: {
//                 //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 //     },
//                 // });
//                 // const docNames = Object.keys(res.data || {});
//                 setDocuments(data);
//             } catch (err) {
//                 console.error("Error loading documents:", err);
//             }
//         };

//         fetchDocuments();
//     }, [collectionPath]);

//     const handleDocumentClick = (docName: string) => {
//         // Navigate to subcollection path like /collections/users/docId
//         navigate(`/collections/${collectionPath}/${docName}`);
//     };

//     return (
//         <div>
//             <h4>Documents in "{collectionPath}"</h4>
//             <ul className="list-group">
//                 {documents.map((docName) => (
//                     <li
//                         key={docName}
//                         className="list-group-item list-group-item-action"
//                         style={{ cursor: "pointer" }}
//                         onClick={() => handleDocumentClick(docName)}
//                     >
//                         {docName}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default DocumentsList;
