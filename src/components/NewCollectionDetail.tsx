import React, { useState, useEffect, JSX } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/AuthService";

import {
    getDocuments,
    updateDocument,
    createDocument,
    deleteDocument,
    toast
} from '../services/api';

type FieldType = "string" | "number" | "boolean" | "array" | "object";

type DocumentType = Record<string, any>;

// type CollectionDetailProps = {
//     collectionName1?: string;
//     viewArray?: (arr: any[]) => JSX.Element; // Make this optional
// };

const NewCollectionDetail = () => { //{ collectionName1, viewArray }
    const { collectionName } = useParams<{ collectionName: string }>();
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<FieldType>("string");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, [collectionName]);

    const fetchDocuments = async () => {
        alert(collectionName);
        // try {
        //     const res = await api.get(`http://10.0.0.202:3000/collections/${collectionName}/documents/`);
        //     setDocuments(res.data);
        // } catch (error) {
        //     console.error("Error fetching documents", error);
        // }

        try {
            let path = collectionName;
            // if (name2 != undefined && name != "") path = path + '/' + name2;
            // if (name3 != undefined && name != "") path = path + '/' + name3;
            // alert(path);
            const data = await getDocuments(path!);
            setDocuments(data);
        } catch (err) {
            // setError('Failed to load documents');
            console.error(err);
        } finally {
            // setLoading(false);
        }
    };

    const handleFieldChange = (docIndex: number, field: string, value: any) => {
        setDocuments((prevDocs) => {
            const updatedDocs = [...prevDocs];
            updatedDocs[docIndex] = { ...updatedDocs[docIndex], [field]: value };
            return updatedDocs;
        });
    };

    const handleSave = async (docId: string, updatedDoc: DocumentType) => {
        try {
            await api.put(`http://10.0.0.202:3000/collections/${collectionName}/${docId}`, updatedDoc);
            alert("Document updated successfully!");
        } catch (error) {
            console.error("Error updating document", error);
        }
    };

    const handleAddField = (docIndex: number) => {
        if (!newFieldName.trim()) return;

        setDocuments((prevDocs) => {
            const updatedDocs = [...prevDocs];
            updatedDocs[docIndex] = {
                ...updatedDocs[docIndex],
                [newFieldName]: newFieldType === "boolean" ? false : newFieldType === "number" ? 0 : newFieldType === "array" ? [] : newFieldType === "object" ? {} : "",
            };
            return updatedDocs;
        });

        setNewFieldName("");
        setNewFieldType("string");
    };

    return (
        <div className="container mt-4">
            <h2>Collection: {collectionName}</h2>

            {documents.map((doc, docIndex) => (
                <div key={docIndex} className="border p-3 mb-3">
                    <h5>Document {docIndex + 1}</h5>

                    {Object.entries(doc).map(([field, value]) => (
                        <div key={field} className="mb-2">
                            <strong>{field}: </strong>
                            {typeof value === "boolean" ? (
                                <Form.Check
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => handleFieldChange(docIndex, field, e.target.checked)}
                                />
                            ) : typeof value === "number" ? (
                                <Form.Control
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleFieldChange(docIndex, field, Number(e.target.value))}
                                />
                            ) : typeof value === "string" ? (
                                <Form.Control
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleFieldChange(docIndex, field, e.target.value)}
                                />
                            ) : Array.isArray(value) ? (
                                <div>
                                    <Button variant="info" size="sm" onClick={() => navigate(`/collection/${collectionName}/document/${docIndex}/array/${field}`)}>
                                        View Array
                                    </Button>
                                </div>
                            ) : typeof value === "object" && value !== null ? (
                                <Button variant="link" onClick={() => navigate(`/collection/${collectionName}/${field}`)}>
                                    Open Subcollection
                                </Button>
                            ) : (
                                <p>Unsupported type</p>
                            )}
                        </div>
                    ))}

                    {/* Add new field */}
                    <div className="mt-3">
                        <h6>Add New Field</h6>
                        <Form.Control
                            type="text"
                            placeholder="Field Name"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                        />
                        <Form.Select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as FieldType)}>
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object (Subcollection)</option>
                        </Form.Select>
                        <Button variant="primary" size="sm" className="mt-2" onClick={() => handleAddField(docIndex)}>
                            Add Field
                        </Button>
                    </div>

                    <Button variant="success" className="mt-2" onClick={() => handleSave(doc._id, doc)}>
                        Save Document
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default NewCollectionDetail;
