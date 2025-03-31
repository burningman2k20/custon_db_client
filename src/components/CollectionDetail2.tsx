import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/AuthService";

type FieldType = "string" | "number" | "boolean" | "array" | "object";

interface DocumentType {
    [key: string]: any;
}

const CollectionDetail2 = () => {
    const { collectionName } = useParams<{ collectionName: string }>();
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<FieldType>("string");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, [collectionName]);

    const fetchDocuments = async () => {
        try {
            const res = await api.get(`http://10.0.0.202:3000/collections/${collectionName}/documents/`);
            setDocuments(res.data);
        } catch (error) {
            console.error("Error fetching documents", error);
        }
    };

    const handleSubCollectionClick = (subCollectionName: string) => {
        navigate(`/collections/${subCollectionName}`);
    };

    const handleFieldChange = (docId: string, field: string, value: any) => {
        setDocuments((prevDocs) => ({
            ...prevDocs,
            [docId]: { ...prevDocs[docId], [field]: value },
        }));
    };

    const handleAddField = (docId: string) => {
        if (!newFieldName) return;
        setDocuments((prevDocs) => ({
            ...prevDocs,
            [docId]: {
                ...prevDocs[docId],
                [newFieldName]: newFieldType === "boolean" ? false :
                    newFieldType === "number" ? 0 :
                        newFieldType === "array" ? [] :
                            newFieldType === "object" ? {} : "",
            },
        }));
        setNewFieldName("");
    };

    const handleSave = async (docId: string) => {
        try {
            await axios.put(`http://localhost:5000/collections/${collectionName}/${docId}`, documents[docId]);
            alert("Document updated successfully!");
        } catch (error) {
            console.error("Error updating document", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Collection: {collectionName}</h2>

            {Object.entries(documents).map(([docId, doc]) => (
                <div key={docId} className="border p-3 mb-3">
                    <h5>Document ID: {docId}</h5>

                    {/* Fields Section */}
                    <h6>Fields</h6>
                    {Object.entries(doc)
                        .filter(([_, value]) => typeof value !== "object" || Array.isArray(value))
                        .map(([field, value]) => (
                            <div key={field} className="mb-2">
                                <strong>{field}: </strong>
                                {typeof value === "boolean" ? (
                                    <Form.Check
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => handleFieldChange(docId, field, e.target.checked)}
                                    />
                                ) : (
                                    <Form.Control
                                        type="text"
                                        value={String(value)}
                                        onChange={(e) => handleFieldChange(docId, field, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}

                    {/* Subcollections and Arrays */}
                    <h6>Subcollections & Arrays</h6>
                    {Object.entries(doc)
                        .filter(([_, value]) => typeof value === "object")
                        .map(([field, value]) => (
                            <div key={field} className="mb-2">
                                <Button variant="link" onClick={() => handleSubCollectionClick(field)}>
                                    {field} (Click to View)
                                </Button>
                            </div>
                        ))}

                    {/* Add New Field */}
                    <div className="mt-3">
                        <h6>Add New Field</h6>
                        <Form.Control
                            type="text"
                            placeholder="Field Name"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                        />
                        <Form.Select
                            className="mt-2"
                            value={newFieldType}
                            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                        </Form.Select>
                        <Button className="mt-2" onClick={() => handleAddField(docId)}>
                            Add Field
                        </Button>
                    </div>

                    <Button className="mt-3" variant="success" onClick={() => handleSave(docId)}>Save</Button>
                </div>
            ))}
        </div>
    );
};

export default CollectionDetail2;
