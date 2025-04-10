import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Modal, Table, Collapse, ModalDialog } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { API_URL, createDocument, deleteDocument, getDocuments, toast, updateDocument } from "../services/api";
import { api } from "../services/AuthService";

type FieldType = "string" | "number" | "boolean" | "array" | "object";

interface DocumentType {
    [key: string]: any;
}

interface NewSubField {
    newKey: string;
    newValue: string;
    newType: FieldType;
}

const CollectionDetail = () => {
    // { collectionName }: { collectionName: string }
    const { collectionName, name2, name3 } = useParams<{ collectionName: string, name2: string, name3: string }>();
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const [newFieldType, setNewFieldType] = useState<FieldType>("string");
    const [newSubFields, setNewSubFields] = useState<Record<string, NewSubField>>({});

    const [subObj, setSubObj] = useState("")

    const [newSubFieldType, setNewSubFieldType] = useState("string");
    const [newDocId, setNewDocId] = useState("");
    const [showNewDocModal, setShowNewDocModal] = useState(false);

    const [showEditObject, setShowEditObject] = useState(false);

    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

    const [subDocId, setSubDocId] = useState<string | null>(null);
    const [subDoc, setSubDoc] = useState<string | null>(null);
    const [SubValue, setSubValue] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [rootDocId, setRootDocId] = useState("");
    const [modalKey, setModalKey] = useState("");
    const [modalValue, setModalValue] = useState<Record<string, any>>();

    const [checkEdit, setCheckEdit] = useState<Record<number, Boolean>>();

    const [arrayType, setArrayType] = useState("fields");

    useEffect(() => {
        fetchDocuments();
    }, [collectionName]);

    const openModal = (content: string, key: string, value: any, docId: string, rootDocId: string) => {
        setRootDocId(rootDocId)
        setSubDocId(docId);
        setModalKey(key);
        setModalValue(value);
        setModalContent(content);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const toggleExpand = (fieldKey: string) => {
        setExpandedFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
    };

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

    const handleCreateNewDocument = async () => {
        if (!newDocId) return;
        try {
            // Create new document with an empty object as its content.
            await createDocument(collectionName!, newDocId, {});
            // const res = await axios.post(`http://localhost:5000/collections/${collectionName}`, { id: newDocId, data: {} });
            // After creation, update state by adding new document.
            setDocuments((prevDocs) => ({ ...prevDocs, [newDocId]: {} }));
            setNewDocId("");
            setShowNewDocModal(false);
            toast("Document created successfully!", "ok");
        } catch (error) {
            console.error("Error creating new document", error);
            toast("Error creating new document", "error");
        }
    };

    // Delete a document.
    const handleDeleteDocument = async (docId: string) => {
        if (!window.confirm(`Are you sure you want to delete document ${docId}?`)) return;
        try {
            await deleteDocument(collectionName!, docId);
            // await axios.delete(`http://localhost:5000/collections/${collectionName}/${docId}`);
            setDocuments((prevDocs) => {
                const newDocs = { ...prevDocs };
                delete newDocs[docId];
                return newDocs;
            });
            // alert("Document deleted successfully!");
            toast("Document deleted successfully!", "ok");
        } catch (error) {
            console.error("Error deleting document", error);
        }
    };

    const handleFieldChange = (docId: string, field: string, value: any) => {
        var newValue = value;
        // if (typeof value === 'object') newValue = JSON.parse(value);
        setDocuments((prevDocs) => ({
            ...prevDocs,
            [docId]: { ...prevDocs[docId], [field]: newValue },
        }));
    };

    const handleDeleteField = (docId: string, field: string) => {
        if (!window.confirm(`Are you sure you want to delete "${field}"?`)) return;
        setDocuments((prevDocs) => {
            const newDoc = { ...prevDocs[docId] };
            delete newDoc[field];
            return { ...prevDocs, [docId]: newDoc };
        });
    };

    // For array fields: update an individual item.
    const handleArrayChange = (docId: string, field: string, index: number, newValue: any) => {
        setDocuments((prevDocs) => {
            const newArray = [...prevDocs[docId][field]];
            newArray[index] = newValue;
            return {
                ...prevDocs,
                [docId]: { ...prevDocs[docId], [field]: newArray },
            };
        });
    };

    // Add a new item to an array field.
    const handleAddArrayItem = (docId: string, field: string, newItem: any) => {
        setDocuments((prevDocs) => {
            const newArray = [...(prevDocs[docId][field] || []), newItem];
            return {
                ...prevDocs,
                [docId]: { ...prevDocs[docId], [field]: newArray },
            };
        });
    };

    // Remove an item from an array field.
    const handleRemoveArrayItem = (docId: string, field: string, index: number) => {
        setDocuments((prevDocs) => {
            const newArray = prevDocs[docId][field].filter((_: any, i: number) => i !== index);
            return {
                ...prevDocs,
                [docId]: { ...prevDocs[docId], [field]: newArray },
            };
        });
    };


    const handleSave = async (docId: string) => {
        try {
            setDocuments(removeNullObjects(documents));
            await updateDocument(collectionName!, docId, documents[docId]);
            // await api.put(`${API_URL}${collectionName}/${docId}`, documents[docId]);
            // alert("Document updated successfully!");
            toast("Document updated successfully!", "ok");
        } catch (error) {
            console.error("Error updating document", error);
        }
    };

    const openFieldModal = (docId: string) => {
        setSelectedDocId(docId);
        setShowFieldModal(true);
    };

    const openEditObject = (value: any) => {
        setShowEditObject(true);
    }

    const handleAddField = () => {
        if (!newFieldName || !selectedDocId) return;

        setDocuments((prevDocs) => ({
            ...prevDocs,
            [selectedDocId]: {
                ...prevDocs[selectedDocId],
                [newFieldName]: newFieldType === "boolean" ? false :
                    newFieldType === "number" ? 0 :
                        newFieldType === "array" ? [] :
                            newFieldType === "object" ? {} : "",
            },
        }));

        setNewFieldName("");
        setShowFieldModal(false);
    };

    const convertSubFieldValue = (value: string, type: FieldType) => {
        switch (type) {
            case "number":
                return Number(value) || 0;
            case "boolean":
                return value === "true";
            case "array":
                return []; // Or parse JSON if needed
            case "object":
                return {}; // Default empty object
            default:
                return value;
        }
    };

    const handleAddSubField = (docId: string, field: string) => {
        const keyForSub = `${docId}_${field}`;
        const subField = newSubFields[keyForSub];
        if (!subField || !subField.newKey) return;
        setDocuments((prevDocs) => {
            const currentObject = { ...(prevDocs[docId][field] || {}) };
            currentObject[subField.newKey] = convertSubFieldValue(subField.newValue, subField.newType);
            return { ...prevDocs, [docId]: { ...prevDocs[docId], [field]: currentObject } };
        });
        // Reset the subfield inputs for this key
        setNewSubFields((prev) => ({
            ...prev,


            [keyForSub]: {
                newKey: subField.newKey, newValue: subField.newValue, newType: subField.newType
            },
        }));
    };

    // Delete a subfield from an object field.
    const handleDeleteSubField = (docId: string, field: string, subKey: string) => {
        if (!window.confirm(`Are you sure you want to delete "${field}"?`)) return;
        setDocuments((prevDocs) => {
            const currentObject = { ...(prevDocs[docId][field] || {}) };
            delete currentObject[subKey];
            return { ...prevDocs, [docId]: { ...prevDocs[docId], [field]: currentObject } };
        });
    };

    function getSubFieldType(newType: string): string {
        switch (newType) {
            case "number":
                return "number";
                break;
            default:
                return "string"
                break;
        }
    }

    // New Document Creation
    const openNewDocModal = () => {
        setShowNewDocModal(true);
    };

    // Safely get nested value (with default fallback)
    function getNestedValue(obj: any, keys: string[]): any {
        return keys.reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
    }

    // Safely set nested value. If a nested property does not exist, initialize it.
    function setNestedValue(obj: any, keys: string[], value: any): any {
        if (!obj) obj = {};
        let current = obj;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                current[key] = value;
            } else {
                if (current[key] === undefined) {
                    // If next key is a number (for array index), initialize as an array; otherwise, object.
                    current[key] = isNaN(Number(keys[index + 1])) ? {} : [];
                }
                current = current[key];
            }
        });
        return obj;
    }
    // 🟩 Add an item to a nested array
    function addToNestedArray(data: any, arrayName: string, objectIndex: number, nestedArrayName: string, value: any) {
        // Get the array: data[arrayName][objectIndex][nestedArrayName]
        const arrayPath = [arrayName, String(objectIndex), nestedArrayName];
        let array = getNestedValue(data[subDocId!], arrayPath);
        if (!array) {
            // If the nested array doesn't exist, initialize it
            data = setNestedValue(data[subDocId!], arrayPath, []);
            array = getNestedValue(data[subDocId!], arrayPath);
        }
        if (!Array.isArray(array)) {
            throw new Error(`Expected an array at path ${arrayPath.join(".")}`);
        }
        array.push(value);
        // alert(array.toString());
        return data;
    }

    // 🟨 Update an item in a nested array
    function updateNestedArrayItem(data: any, arrayName: string, objectIndex: number, nestedArrayName: string, itemIndex: number, newValue: any) {
        const arrayPath = [arrayName, String(objectIndex), nestedArrayName];
        let array = getNestedValue(data, arrayPath);
        if (!array || !Array.isArray(array)) {
            throw new Error(`No array found at path ${arrayPath.join(".")}`);
        }
        array[itemIndex] = newValue;
        return data;
    }

    // 🟥 Delete an item from a nested array
    function deleteFromNestedArray(data: any, docId: string, arrayName: string, objectIndex: number, nestedArrayName: string, itemIndex: number) {
        // const arrayPath = [field, String(objectIndex), nestedArrayName];
        // let array = getNestedValue(data, arrayPath);
        // alert(arrayPath)
        // alert(array)

        const arrayPath = [arrayName, String(objectIndex), nestedArrayName];
        let array = getNestedValue(data, arrayPath);
        if (!array || !Array.isArray(array)) {
            throw new Error(`No array found at path ${arrayPath.join(".")}`);
        }
        array.splice(itemIndex, 1);
        return data;

    }

    // Helper: Get value from path
    const getValueFromPath = (obj: any, path: string) => {
        return path.split(".").reduce((acc, key) => {
            const k = isNaN(Number(key)) ? key : Number(key);
            return acc?.[k];
        }, obj);
    };

    // Helper: Set value at path
    const setValueAtPath = (obj: any, path: string, value: any) => {
        const keys = path.split(".");
        const newData = { ...obj };
        // structuredClone(obj);

        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
            if (!(key in current)) {
                current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
            }
            current = current[key];
        }

        const lastKey = isNaN(Number(keys.at(-1)!)) ? keys.at(-1)! : Number(keys.at(-1)!);
        current[lastKey] = value;
        setDocuments(newData);
        return newData;
    };

    function deleteValueAtPath(obj: any, path: string): void {
        const keys = path.split(".");

        const newData = { ...obj };
        // structuredClone(obj);

        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
            if (!current) return;
        }

        delete current[keys[keys.length - 1]];
        // setDocuments(removeNullObjects(newData));
    }

    function removeNullObjects(obj: any): any {
        if (Array.isArray(obj)) {
            return obj
                .map(removeNullObjects)
                .filter((item) => item !== null && item !== undefined);
        }

        if (obj !== null && typeof obj === "object") {
            const cleaned: Record<string, any> = {};
            for (const key in obj) {
                const value = removeNullObjects(obj[key]);
                if (value !== null && value !== undefined) {
                    cleaned[key] = value;
                }
            }

            // If cleaned object is empty after removing nulls, return null
            return Object.keys(cleaned).length === 0 ? null : cleaned;
        }

        return obj;
    }


    return (
        <div className="container mt-4">
            <h2>Collection: {collectionName}</h2>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="primary" onClick={openNewDocModal}>
                    Add New Document
                </Button>
            </div>
            {Object.entries(documents).map(([docId, doc]) => (
                <div key={docId} className="border p-3 mb-3">
                    <h5>Document ID: {docId}</h5>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteDocument(docId)}>
                        Delete Document
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => openFieldModal(docId)}>
                        Add Field
                    </Button>
                    <Button variant="success" size="sm" className="ms-2" onClick={() => handleSave(docId)}>
                        Save
                    </Button>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(doc).map(([field, value]) => {
                                // Determine field type.
                                const fieldType =
                                    typeof value === "object"
                                        ? Array.isArray(value)
                                            ? "array"
                                            : "object"
                                        : typeof value;
                                return (





                                    <tr key={field}>
                                        <td>{field}</td>
                                        <td>{fieldType}</td>
                                        <td>
                                            {fieldType === "boolean" ? (
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={!!value}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        handleFieldChange(docId, field, e.target.checked)
                                                    }
                                                />
                                            ) : fieldType === "array" ? (
                                                <div>
                                                    {value.map((item: any, index: number) => (
                                                        <div key={index} className="d-flex align-items-center mb-2">
                                                            <Form.Control
                                                                type="text"
                                                                value={item}
                                                                onChange={(e) =>
                                                                    handleArrayChange(docId, field, index, e.target.value)
                                                                }
                                                            />
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                className="ms-2"
                                                                onClick={() => handleRemoveArrayItem(docId, field, index)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="New item"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                handleAddArrayItem(docId, field, e.currentTarget.value);
                                                                e.currentTarget.value = "";
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : fieldType === "object" ? (
                                                <div>
                                                    <Table size="sm" bordered striped hover>
                                                        <thead>
                                                            <tr>
                                                                <th>Key</th>
                                                                <th>Value</th>
                                                                <th>Type</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                                <tr key={subKey}>
                                                                    <td>{subKey}</td>
                                                                    <td>
                                                                        {typeof subValue === 'boolean' && (
                                                                            <div className="mb-3">
                                                                                <Form.Check
                                                                                    type="switch"
                                                                                    className="form-check"
                                                                                    value={subValue as any}

                                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                                        handleFieldChange(docId, field, {
                                                                                            ...value,
                                                                                            [subKey]: e.target.checked,
                                                                                        })
                                                                                    }
                                                                                />
                                                                            </div>

                                                                        )}
                                                                        {typeof subValue === 'number' && (
                                                                            <Form.Control
                                                                                type="number"
                                                                                value={subValue as any}

                                                                                onChange={(e) =>
                                                                                    handleFieldChange(docId, field, {
                                                                                        ...value,
                                                                                        [subKey]: Number(e.target.value),
                                                                                    })
                                                                                }
                                                                            />
                                                                        )}
                                                                        {typeof subValue === 'string' && (
                                                                            <Form.Control
                                                                                type="text"
                                                                                value={String(subValue)}

                                                                                onChange={(e) =>
                                                                                    handleFieldChange(docId, field, {
                                                                                        ...value,
                                                                                        [subKey]: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        )}
                                                                        {typeof subValue === 'object' && (
                                                                            <div>


                                                                                <button className="btn btn-outline-info" onClick={() => {
                                                                                    // setRootDocId(field);

                                                                                    openModal("Sub Collection : " + subKey, subKey, subValue, docId, field)
                                                                                }}>View</button>
                                                                            </div>
                                                                        )}

                                                                    </td>
                                                                    <td>{typeof subValue} {Array.isArray(subValue)}</td>
                                                                    <td>
                                                                        <Button
                                                                            variant="danger"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteSubField(docId, field, subKey)}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>

                                                    {/* New Subfield Inputs */}
                                                    <Form.Group className="mt-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="New subfield key"
                                                            value={newSubFields[`${docId}_${field}`]?.newKey || ""}
                                                            onChange={(e) =>
                                                                setNewSubFields((prev) => ({
                                                                    ...prev,
                                                                    [`${docId}_${field}`]: {
                                                                        ...(prev[`${docId}_${field}`] || { newType: "string" }),
                                                                        newKey: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                        <Form.Control
                                                            type={getSubFieldType(newSubFields[`${docId}_${field}`]?.newType)}
                                                            placeholder="New subfield value"
                                                            className="mt-1"
                                                            value={newSubFields[`${docId}_${field}`]?.newValue || ""}
                                                            onChange={(e) =>
                                                                setNewSubFields((prev) => ({
                                                                    ...prev,
                                                                    [`${docId}_${field}`]: {
                                                                        ...(prev[`${docId}_${field}`] || { newType: "string" }),
                                                                        newValue: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                        <Form.Select
                                                            className="mt-1"
                                                            value={newSubFields[`${docId}_${field}`]?.newType || "string"}
                                                            onChange={(e) => {
                                                                setNewSubFieldType(e.target.value);
                                                                setNewSubFields((prev) => ({
                                                                    ...prev,
                                                                    [`${docId}_${field}`]: {
                                                                        ...(prev[`${docId}_${field}`] || { newKey: "", newValue: "" }),
                                                                        newType: e.target.value as FieldType,
                                                                    },
                                                                }))
                                                            }
                                                            }
                                                        >
                                                            <option value="string">String</option>
                                                            <option value="number">Number</option>
                                                            <option value="boolean">Boolean</option>
                                                            <option value="array">Array</option>
                                                            <option value="object">Object</option>
                                                        </Form.Select>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="mt-1"
                                                            onClick={() => handleAddSubField(docId, field)}
                                                        >
                                                            Add Subfield
                                                        </Button>
                                                    </Form.Group>
                                                </div>
                                            ) : (
                                                <Form.Control
                                                    type="text"
                                                    value={String(value)}
                                                    onChange={(e) => handleFieldChange(docId, field, e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <Button variant="warning" size="sm" onClick={() => handleDeleteField(docId, field)}>
                                                Delete Field
                                            </Button>
                                        </td>
                                        {/* // end of row */}

                                    </tr>

                                );
                            })}
                        </tbody>
                    </Table>

                </div>
            ))}

            {/* Modal for adding a new field */}
            <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Field</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Field Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                        />
                    </Form.Group>
                    {/* <Form.Group>
                        <Form.Label>Field Value</Form.Label>
                        <Form.Control
                            type={getSubFieldType(newFieldType)}
                            value={newFieldValue}
                            onChange={(e) => setNewFieldValue(e.target.value)}
                        />
                    </Form.Group> */}
                    <Form.Group className="mt-3">
                        <Form.Label>Field Type</Form.Label>
                        <Form.Select
                            value={newFieldType}
                            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFieldModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddField}>
                        Add Field
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for creating a new document */}
            <Modal show={showNewDocModal} onHide={() => setShowNewDocModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Document</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Document ID</Form.Label>
                        <Form.Control
                            type="text"
                            value={newDocId}
                            onChange={(e) => setNewDocId(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNewDocModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateNewDocument}>
                        Create Document
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditObject} onHide={() => setShowEditObject(false)} >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Object</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                </Modal.Body>

                <Modal.Footer>
                </Modal.Footer>
            </Modal>


            {showModal && (
                <Modal show={showModal} scrollable={true} onHide={closeModal} size="lg">
                    {/* {typeof modalValue && Array.isArray(modalValue) ? setArrayType('objects') : setArrayType('fields')} */}
                    <Modal.Header closeButton closeLabel="Close">
                        <Modal.Title>View {modalKey} ({typeof modalValue && Array.isArray(modalValue) ? 'Array' : 'Object'})</Modal.Title>

                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <Table size="md" bordered striped hover>
                                <thead>
                                    <tr>
                                        <th>Field</th>
                                        <th>Value</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Object.entries(modalValue!).map(([field, value], index) => (
                                        <>
                                            {/* {typeof value === 'object' ? (
                                                setArrayType('objects')
                                            ) : (
                                                setArrayType('fields')
                                            )} */}
                                            <tr key={field}>
                                                <td>{field}</td>
                                                <td>
                                                    {typeof value === 'boolean' && (
                                                        <div className="mb-3">
                                                            <Form.Check
                                                                type="switch"
                                                                className="form-check"
                                                                checked={value}
                                                                // value={value as unknown as number}

                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + field
                                                                    // alert(path)
                                                                    // alert(getValueFromPath(documents, path))
                                                                    setValueAtPath(documents, path, e.target.checked)
                                                                    // alert(getValueFromPath(documents, path))
                                                                }
                                                                    // handleFieldChange(subDocId!, field, {
                                                                    //     ...value as Boolean,
                                                                    //     [field]: e.target.checked,
                                                                    // })
                                                                }
                                                            />
                                                        </div>

                                                    )}
                                                    {typeof value === 'number' && (
                                                        <Form.Control
                                                            type="number"
                                                            value={value as any}

                                                            onChange={(e) => {
                                                                const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + field
                                                                setValueAtPath(documents, path, Number(e.target.value))
                                                            }
                                                                // handleFieldChange(subDocId!, field, {
                                                                //     ...value as Number,
                                                                //     [field]: Number(e.target.value),
                                                                // })
                                                            }
                                                        />
                                                    )}
                                                    {typeof value === 'string' && (
                                                        <Form.Control
                                                            type="text"
                                                            value={String(value)}

                                                            onChange={(e) => {
                                                                const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + field
                                                                setValueAtPath(documents, path, String(e.target.value))
                                                            }
                                                                // handleFieldChange(subDocId!, field, {
                                                                //     ...value as String,
                                                                //     [field]: e.target.value,
                                                                // })
                                                            }
                                                        />
                                                    )}
                                                    {typeof value === 'object' && value !== null && (
                                                        <div>
                                                            <Table bordered striped hover>
                                                                <thead>
                                                                    <th>Field</th>
                                                                    <th>Value</th>
                                                                    <th>Type</th>
                                                                    <th>Actions</th>
                                                                </thead>
                                                                <tbody>
                                                                    {Object.entries(value).map(([field1, value1], objIndex) => (
                                                                        <>
                                                                            <tr>
                                                                                <td>{field1}</td>
                                                                                <td>
                                                                                    {!Array.isArray(value1) && typeof value1 === 'string' && (
                                                                                        // <p>{String(value1)}</p>
                                                                                        <Form.Control
                                                                                            value={value1}
                                                                                            type="text"

                                                                                        />
                                                                                    )}
                                                                                    {!Array.isArray(value1) && typeof value1 === 'boolean' && (
                                                                                        // <p>{String(value1)}</p>
                                                                                        <Form.Check
                                                                                            checked={value1 as boolean}
                                                                                            type="switch"

                                                                                        />
                                                                                    )}
                                                                                    {!Array.isArray(value1) && typeof value1 === 'number' && (
                                                                                        // <p>{String(value1)}</p>
                                                                                        <Form.Control
                                                                                            value={value1 as number}
                                                                                            type="number"

                                                                                        />
                                                                                    )}

                                                                                </td>
                                                                                <td>
                                                                                    {typeof value1 === 'object'
                                                                                        && Array.isArray(value1) && value1 !== null &&
                                                                                        (
                                                                                            <div>
                                                                                                {value1.map((item: any, index: number) => (
                                                                                                    <div key={index} className="d-flex align-items-center mb-2">
                                                                                                        <Form.Control
                                                                                                            type="text"
                                                                                                            value={item}
                                                                                                            onChange={(e) =>
                                                                                                                handleArrayChange(subDocId!, field1, index, e.target.value)
                                                                                                            }
                                                                                                        />
                                                                                                        <Button
                                                                                                            variant="danger"
                                                                                                            size="sm"
                                                                                                            className="ms-2"
                                                                                                            onClick={() => {
                                                                                                                // alert(documents[subDocId!][index][field1]);
                                                                                                                // deleteFromNestedArray(documents, subDocId!, field, objIndex, field1, index);
                                                                                                                if (!window.confirm(`Are you sure you want to delete "${field1}"?`)) return;
                                                                                                                value1.splice(index, 1);

                                                                                                                handleRemoveArrayItem(subDocId!, field1, index)
                                                                                                            }
                                                                                                            }
                                                                                                        >
                                                                                                            Remove
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                ))}
                                                                                                <Form.Control
                                                                                                    type="text"
                                                                                                    placeholder="New item"
                                                                                                    onKeyDown={(e) => {
                                                                                                        if (e.key === "Enter") {
                                                                                                            value1.push(e.currentTarget.value)
                                                                                                            handleAddArrayItem(subDocId!, field1, e.currentTarget.value);
                                                                                                            e.currentTarget.value = "";
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                    {/* {typeof value1 === 'object'
                                                                                        && !Array.isArray(value1) &&
                                                                                        (<p>object</p>)} */}

                                                                                    {!Array.isArray(value1) && value1 !== null && (
                                                                                        <p>{typeof value1}</p>
                                                                                    )}

                                                                                    {/* {typeof value1} */}

                                                                                </td>
                                                                                <td><Button variant="danger" size="sm" onClick={() => {
                                                                                    const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + field + '.' + field1
                                                                                    // alert(path)
                                                                                    // alert(getValueFromPath(documents, path));
                                                                                    if (!window.confirm(`Are you sure you want to delete "${field1}"?`)) return;
                                                                                    deleteValueAtPath(documents, path);
                                                                                }
                                                                                }>Delete</Button></td>

                                                                            </tr>
                                                                        </>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                            {/* <button className="btn btn-outline-info" onClick={() => { setSubObj(JSON.stringify(subValue, null, 2)) }}>Edit</button> */}
                                                            {/* {typeof value === 'object' && Array.isArray(value) && Array.isArray(subValue) && ( */}
                                                            {/* <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue)}>View</button> */}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{typeof value}</td>
                                                <td>
                                                    <div className="">
                                                        {Array.isArray(value) && value !== null && (
                                                            <td>array</td>
                                                        )}
                                                        {typeof value === 'object' && value !== null && (
                                                            <>
                                                                <Form.Control
                                                                    type="text"
                                                                    onChange={(e) => {
                                                                        setNewFieldName(e.currentTarget.value);
                                                                    }

                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + String(index) + '.' + field + '.' + e.currentTarget.value;
                                                                            // setNewFieldName(e.currentTarget.value);
                                                                            // setNewFieldValue()
                                                                            // setValueAtPath(documents, path, e.currentTarget.value);
                                                                            alert(path);
                                                                            // modalValue![index][e.currentTarget.value] = ""
                                                                        }

                                                                    }}
                                                                />
                                                                <Form.Select value={newFieldType}
                                                                    onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                                                                >
                                                                    {/* <option>Open this select menu</option> */}
                                                                    <option value="string">String</option>
                                                                    <option value="number">Number</option>
                                                                    <option value="boolean">Boolean</option>
                                                                </Form.Select>
                                                                <Button variant="success" size="sm" onClick={() => {
                                                                    // alert(rootDocId);
                                                                    const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + String(index) + '.' + newFieldName;// + '.'

                                                                    // alert(path)
                                                                    // alert(newFieldType);
                                                                    switch (newFieldType) {
                                                                        case 'number':
                                                                            setValueAtPath(documents, path, 0);
                                                                            break
                                                                        case 'boolean':
                                                                            setValueAtPath(documents, path, false);
                                                                            break
                                                                        default:
                                                                            setValueAtPath(documents, path, 'new string');
                                                                    }

                                                                    // setValueAtPath(documents, path, 'new data');
                                                                    // alert(getValueFromPath(documents, path + '.' + newFieldName));
                                                                    // alert(index);

                                                                    // alert(modalValue![index]['fuker']);
                                                                }}>Add</Button>
                                                            </>
                                                        )}
                                                        <Button variant="warning" size="sm" onClick={() => {
                                                            const path = subDocId! + '.' + rootDocId! + '.' + modalKey + '.' + field
                                                            // alert(path)
                                                            if (!window.confirm(`Are you sure you want to delete "${field}"?`)) return;
                                                            // alert(getValueFromPath(documents, path));
                                                            deleteValueAtPath(documents, path);
                                                        }
                                                        }>Delete Field</Button>
                                                    </div>
                                                </td>
                                            </tr>

                                        </>

                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {Array.isArray(modalValue!) && (
                            <Form.Group>
                                <Form.Label>Array Type</Form.Label>
                                <Form.Select value={arrayType} onChange={(e) => setArrayType(e.target.value)}>
                                    <option value="fields">Fields</option>
                                    <option value="objects">Objects</option>
                                </Form.Select>
                            </Form.Group>
                        )
                        }




                        {arrayType === 'fields' && (
                            <>
                                {/* {Array.isArray(modalValue) ? (
                                    <Form.Group>
                                        <Form.Label>Field Value</Form.Label>
                                        <Form.Control
                                            type="text"
                                            onChange={(e) => setNewFieldValue(e.currentTarget.value)}
                                            value={newFieldValue}
                                            placeholder='enter value'>

                                        </Form.Control>
                                    </Form.Group>
                                ) : ( */}
                                <Form.Group>
                                    <Form.Label>Field Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        onChange={(e) => setNewFieldName(e.currentTarget.value)}
                                        value={newFieldName}
                                        placeholder='field name'>

                                    </Form.Control>
                                </Form.Group>
                                {/* )} */}


                                <Form.Group>
                                    <Form.Label>Field Type</Form.Label>
                                    <Form.Select value={newFieldType}
                                        onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                                    >
                                        {/* <option>Open this select menu</option> */}
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                    </Form.Select>

                                </Form.Group>


                                <Button variant="success" onClick={() => {
                                    // return
                                    // documents[subDocId!][modalKey].
                                    // modalValue!.push({})
                                    //  // between root and field
                                    // alert(Array.isArray(modalValue))
                                    var path = subDocId! + '.' + rootDocId! + '.' + modalKey;// + '.'
                                    // var path = rootDocId + '.' + modalKey;
                                    // path += '.' + newFieldName;
                                    if (Array.isArray(modalValue)) {
                                        modalValue!.push();
                                        path += '.' + modalValue!.length;
                                    }
                                    if (!Array.isArray(modalValue) && typeof modalValue === 'object') {
                                        // modalValue!.push();
                                        path += '.' + newFieldName;
                                    }


                                    // alert(path)
                                    // alert(path + '.' + newFieldName)

                                    switch (newFieldType) {
                                        case 'number':
                                            setValueAtPath(documents, path, Number(newFieldValue));
                                            break
                                        case 'boolean':
                                            setValueAtPath(documents, path, Boolean(newFieldValue));
                                            break
                                        default:
                                            setValueAtPath(documents, path, newFieldValue);

                                    }
                                    // setValueAtPath(documents, path, newFieldValue)
                                    setNewFieldValue('')
                                }
                                }>Add Field</Button>
                            </>
                        )
                        }
                        {arrayType === 'objects' && (
                            <>
                                <Button variant="success" onClick={() => {
                                    // documents[subDocId!][modalKey].
                                    var path = subDocId! + '.' + rootDocId! + '.' + modalKey
                                    // alert(Array(modalValue![modalKey]).length)
                                    // alert(path)
                                    // alert(getValueFromPath(documents, path))
                                    if (Array.isArray(modalValue)) {
                                        path += '.' + modalValue!.length;
                                    }


                                    setValueAtPath(documents, path, {})
                                    // modalValue!.push({})
                                }
                                }>Add Object</Button>
                            </>
                        )}

                        {/* <Button>Help</Button> */}
                    </Modal.Footer>
                    <Modal.Footer>
                        <p>something goes here</p>
                    </Modal.Footer>


                </Modal>
            )}


        </div >


    );


};

export default CollectionDetail;
