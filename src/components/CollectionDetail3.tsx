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
    const [modalKey, setModalKey] = useState("");
    const [modalValue, setModalValue] = useState<Record<string, any>>();

    const [checkEdit, setCheckEdit] = useState<Record<number, Boolean>>();

    useEffect(() => {
        fetchDocuments();
    }, [collectionName]);

    const openModal = (content: string, key: string, value: any, docId: string) => {
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
                                                    <Table size="sm" bordered>
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
                                                                                {/* <button className="btn btn-outline-info" onClick={() => { setSubObj(JSON.stringify(subValue, null, 2)) }}>Edit</button> */}
                                                                                {/* {typeof value === 'object' && Array.isArray(value) && Array.isArray(subValue) && ( */}
                                                                                <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue, docId)}>View</button>
                                                                                {/* )} */}

                                                                                {/* {typeof value === 'object' && typeof subValue === 'object' && !Array.isArray(value) && !Array.isArray(subValue) && (
                                                                                    <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue)}>Edit 1</button>
                                                                                )}

                                                                                {typeof value === 'object' && typeof subValue === 'object' && !Array.isArray(value) && Array.isArray(subValue) && (
                                                                                    <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue)}>Edit 2</button>
                                                                                )} */}

                                                                                {/* {typeof value === 'object' && !Array.isArray(value) && (
                                                                                    <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue)}>Edit 2</button>
                                                                                )} */}


                                                                                {/* <button className="btn btn-outline-info" onClick={() => openModal("Sub Collection : " + subKey, subKey, subValue)}>View</button> */}
                                                                                {/* <Form.Control
                                                                                    type="text"
                                                                                    value={subObj}
                                                                                    // {JSON.stringify(subValue, null, 2)}


                                                                                    onChange={(e) => setSubObj(e.target.value)}
                                                                                    // JSON.stringify(subValue, null, 2)
                                                                                    onKeyDown={(e) => {//{ return }
                                                                                        if (e.key === 'Enter') {
                                                                                            // alert("enter")
                                                                                            // handleFieldChange(docId, field, {
                                                                                            //     ...value,
                                                                                            //     [subKey]: JSON.parse(subObj)

                                                                                            // })
                                                                                        }
                                                                                    }

                                                                                    }
                                                                                />*/}
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
                    <Modal.Header closeButton closeLabel="Close">
                        <Modal.Title>View {modalKey} ({typeof modalValue && Array.isArray(modalValue) ? 'Array' : 'Object'})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <Table size="md" bordered>
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
                                            <tr key={field}>
                                                <td>{field}</td>
                                                <td>
                                                    {typeof value === 'boolean' && (
                                                        <div className="mb-3">
                                                            <Form.Check
                                                                type="switch"
                                                                className="form-check"
                                                                value={value as any}

                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                    handleFieldChange(subDocId!, field, {
                                                                        ...value as Boolean,
                                                                        [field]: e.target.checked,
                                                                    })
                                                                }
                                                            />
                                                        </div>

                                                    )}
                                                    {typeof value === 'number' && (
                                                        <Form.Control
                                                            type="number"
                                                            value={value as any}

                                                            onChange={(e) =>
                                                                handleFieldChange(subDocId!, field, {
                                                                    ...value as Number,
                                                                    [field]: Number(e.target.value),
                                                                })
                                                            }
                                                        />
                                                    )}
                                                    {typeof value === 'string' && (
                                                        <Form.Control
                                                            type="text"
                                                            value={String(value)}

                                                            onChange={(e) =>
                                                                handleFieldChange(subDocId!, field, {
                                                                    ...value as String,
                                                                    [field]: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    )}
                                                    {typeof value === 'object' && (
                                                        <div>
                                                            <Table bordered>
                                                                <thead>
                                                                    <th>Field</th>
                                                                    <th>Value</th>
                                                                    <th>Type</th>
                                                                    <th>Actions</th>
                                                                </thead>
                                                                <tbody>
                                                                    {Object.entries(value).map(([field1, value1]) => (
                                                                        <>
                                                                            <tr>
                                                                                <td>{field1}</td>
                                                                                <td>
                                                                                    {String(value1)}
                                                                                </td>
                                                                                <td>
                                                                                    {typeof value1}

                                                                                </td>
                                                                                <td><Button variant="danger" size="sm">Delete</Button></td>

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
                                                        {typeof value === 'object' && (
                                                            <Button variant="success" size="sm" onClick={() => {
                                                                alert(index);
                                                            }}>Add</Button>
                                                        )}
                                                        <Button variant="warning" size="sm">Delete Field</Button>
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
                        <Button>Add</Button>
                        <Button>Help</Button>
                    </Modal.Footer>
                    <Modal.Footer>
                        <p>something goes here</p>
                    </Modal.Footer>


                </Modal>
            )}

            {/* Modal Component */}
            {showEditObject && (
                <Modal show={showModal} scrollable={true} onHide={closeModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Modal Title</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* {modalContent} */}
                        {/* <Table>
                            <thead>
                                <tr>
                                    <th><strong>Index {modalKey}</strong></th>
                                    <th>Type {typeof modalValue}</th>
                                </tr>
                            </thead>
                            <tbody> */}

                        <div className="d-flex">
                            <strong>Sub Collection Name : </strong> <p>{modalKey}</p>
                        </div>

                        {Array.isArray(modalValue) && (
                            <div className="d-flex">
                                <strong>Sub Collection Type : </strong> <p>Array</p>
                            </div>
                        )
                        }

                        {!Array.isArray(modalValue) && (
                            <div className="d-flex">
                                <strong>Sub Collection Type : </strong> <p> Object</p>
                            </div>

                        )

                        }
                        <Table bordered>

                            {/* {typeof modalValue !== 'object' && !Array.isArray(modalValue) && ( */}
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Field</th>
                                    <th>Value</th>
                                    <th>Type</th>
                                    {/* <th>Actions</th> */}
                                </tr>
                            </thead>

                            {/* )}
                            {typeof modalValue === 'object' && !Array.isArray(modalValue) && (
                                <thead>
                                    <tr>
                                        <th>New Index</th>
                                        <th>Field</th>
                                        <th>Value</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                            )} */}



                            <tbody>

                                {Object.entries(modalValue!).map(([field, value]) => {
                                    return (
                                        <>
                                            <tr key={field}>
                                                {typeof value === 'string' && (
                                                    <>
                                                        <td></td>
                                                        <td> <Form.Label>{field}</Form.Label></td>
                                                        <td>
                                                            <Form.Group>

                                                                <Form.Control
                                                                    type="text"
                                                                    value={value}
                                                                // onChange={(e) => setNewFieldName(e.target.value)}
                                                                />


                                                            </Form.Group>

                                                        </td>
                                                        <td>{typeof value}</td>
                                                        {/* <td>
                                                            <button className="btn btn-danger">Delete</button>
                                                        </td> */}
                                                    </>
                                                )}

                                                {typeof value === 'boolean' && (
                                                    <>
                                                        <td></td>
                                                        <td>
                                                            <Form.Label>{field}</Form.Label>
                                                        </td>
                                                        <Form.Group>


                                                            <td>

                                                                <Form.Check

                                                                    // type="text"
                                                                    checked={value}
                                                                // onChange={(e) => setNewFieldName(e.target.value)}
                                                                />

                                                            </td>


                                                        </Form.Group>
                                                        <td>
                                                            {typeof value}
                                                        </td>
                                                        {/* <td>
                                                            <button className="btn btn-danger">Delete</button>
                                                        </td> */}
                                                    </>

                                                )}

                                                {typeof value === 'number' && (
                                                    <>
                                                        <td></td>
                                                        <td><Form.Label>{field}</Form.Label></td>
                                                        <td>
                                                            <Form.Group>


                                                                <Form.Control
                                                                    type="number"
                                                                    value={value}
                                                                // onChange={(e) => setNewFieldName(e.target.value)}
                                                                />



                                                            </Form.Group>
                                                        </td>
                                                        {/* <td>
                                                            <button className="btn btn-danger">Delete</button>
                                                        </td> */}

                                                    </>
                                                )
                                                }

                                                {typeof value === 'object' && (
                                                    <thead>
                                                        {/* <th>Index</th>
                                                        <th>Field Name</th>
                                                        <th>Field Value</th>
                                                        <th>Field Type</th>
                                                        <th>Actions</th> */}
                                                    </thead>
                                                )
                                                }

                                                {typeof value === 'object' && (

                                                    Object.entries(value!).map(([field1, value1]) => {

                                                        return (
                                                            <Table bordered>
                                                                <tr>
                                                                    <td>{field}</td>


                                                                    {typeof value1 === 'string' && (
                                                                        <>

                                                                            <td><Form.Label>{field1}</Form.Label></td>
                                                                            <td>
                                                                                {/* <Form.Group> */}


                                                                                <Form.Control
                                                                                    className=""
                                                                                    type="text"
                                                                                    value={value1}
                                                                                // onChange={(e) => setNewFieldName(e.target.value)}
                                                                                />



                                                                                {/* </Form.Group> */}
                                                                            </td>
                                                                            <td>{typeof value1}</td>
                                                                            {/* <td>
                                                                                <button className="btn btn-danger">Delete</button>
                                                                            </td> */}

                                                                        </>

                                                                        // <p>{field1} String {String(value1)}</p>
                                                                    )}
                                                                    {typeof value1 === 'boolean' && (
                                                                        <>
                                                                            <td> <Form.Label>{field1}</Form.Label></td>
                                                                            <td>
                                                                                <Form.Group>
                                                                                    <Form.Check
                                                                                        className=""
                                                                                        // type="text"
                                                                                        checked={value1}
                                                                                    // onChange={(e) => setNewFieldName(e.target.value)}
                                                                                    />
                                                                                </Form.Group>
                                                                            </td>
                                                                            <td>{typeof value1}</td>
                                                                            {/* <td>
                                                                                <button className="btn btn-danger">Delete</button>
                                                                            </td> */}

                                                                        </>
                                                                    )}

                                                                    {typeof value1 === 'number' && (
                                                                        <>
                                                                            <td>
                                                                                <Form.Label>{field1}</Form.Label>
                                                                            </td>
                                                                            <Form.Group>
                                                                                <td>

                                                                                    <Form.Control
                                                                                        className=""
                                                                                        type="number"
                                                                                        value={value1}
                                                                                    // onChange={(e) => setNewFieldName(e.target.value)}
                                                                                    />

                                                                                </td>

                                                                            </Form.Group>
                                                                            <td>{typeof value1}</td>
                                                                            {/* <td>
                                                                                <button className="btn btn-danger">Delete</button>
                                                                            </td> */}

                                                                        </>
                                                                    )
                                                                    }

                                                                </tr>
                                                            </Table>
                                                        )

                                                    }

                                                    ) // end Objects.entries

                                                )

                                                }

                                            </tr>
                                        </>
                                    )
                                })}
                            </tbody>

                        </Table>


                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {

                        }}>
                            Add
                        </Button>
                        <Button variant="secondary" onClick={closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
            }
        </div >


    );


};

export default CollectionDetail;
