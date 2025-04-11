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
                <h2>Documents</h2>
                <div className="card mt-lg-5 mb-lg-3 mx-lg-5 shadow-lg">
                    <div className="card-header">
                        <div className="d-flex justify-content-between">
                            <h5>Collection : {collectionName}</h5>
                            <Button className="btn btn-primary btn-sm" onClick={() => {
                                window.history.back();
                            }}>Back</Button>
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
                                // onClick={() => handleDeleteCollection(name)}
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
