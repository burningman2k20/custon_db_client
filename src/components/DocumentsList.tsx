import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocuments, toast, DocumentType } from "../services/api";
import { Button } from "react-bootstrap";

type FieldType = "string" | "number" | "boolean" | "array" | "object";

// interface DocumentType {
//     [key: string]: any;
// }

export const DocumentsList = () => {
    const { collectionName } = useParams<{ collectionName: string }>();
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});

    const navigate = useNavigate();

    //
    // React Hook to monitor documents list
    //
    useEffect(() => {
        fetchDocuments();
    }, [collectionName]);

    const fetchDocuments = async () => {
        try {
            // const res = await axios.get(`http://localhost:5000/collections/${collectionName}`);
            // setDocuments(res.data);
            const data = await getDocuments(collectionName!);
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents", error);
            toast("Error fetching documents", "error");
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="card">
                    <div className="card-header">
                        <div className="d-flex justify-content-between">
                            Collection : {collectionName}
                            <Button className="btn btn-primary btn-sm" onClick={() => {
                                window.history.back();
                            }}>Back</Button>
                        </div>
                    </div>
                    <div className="card-body">List of User Documents are listed Below</div>
                </div>
                <br />

                <div className="card">
                    <div className="card-header">Documents</div>
                    {Object.entries(documents).map(([docId, doc], index) => (
                        <>
                            <div className="card">
                                <div className="card-body d-flex justify-content-between">
                                    <div className="card-title ">{docId}</div>
                                    {/* <div className="card-footer"> */}
                                    <Button className="btn btn-primary" onClick={() => {
                                        // setDocumentPath(`${docId}`);
                                        navigate(`/${collectionName}/document/${docId}`)
                                    }}>
                                        View</Button>
                                    {/* </div> */}
                                </div>
                            </div>
                            <br />
                        </>
                    ))}
                </div>
            </div>
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
