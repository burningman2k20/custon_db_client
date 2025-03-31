import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getDocuments,
    updateDocument,
    createDocument,
    deleteDocument,
    toast
} from '../services/api';

import Swal from 'sweetalert2';
import { TIMEOUT } from 'dns';
import { Button, Form } from 'react-bootstrap';

export default function CollectionDetail() { // { collectionName }: { collectionName: string }
    const { name, name2, name3 } = useParams<{ name: string, name2: string, name3: string }>();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<Record<string, any>>({});
    const [newDocId, setNewDocId] = useState('');
    const [newDocFields, setNewDocFields] = useState<Record<string, any>>({});
    const [nestedPath, setNestedPath] = useState('');
    const [nestedValue, setNestedValue] = useState<any>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New field state
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('Document');  //useState<'string' | 'number' | 'boolean'>('string');
    const [newSubFieldType, setNewSubFieldType] = useState('string');
    const [newFieldValue, setNewFieldValue] = useState<string | number | boolean>('');
    const [types, setTypes] = useState<Record<number, string>>({});

    const [selectedSubCollection, setSelectedSubCollection] = useState<string | null>(null);

    // const [rootPath, setRootPath] = useState('');

    const [fieldTypes, setFieldTypes] = useState({}); // Track field types

    useEffect(() => {
        if (name) {

            loadDocuments();
        }
    }, [name]);
    // alert(name);
    // alert(name2);
    // alert(name3);

    const loadDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            let path = name;
            if (name2 != undefined && name != "") path = path + '/' + name2;
            if (name3 != undefined && name != "") path = path + '/' + name3;
            // alert(path);
            const data = await getDocuments(path!);
            setDocuments(data);
        } catch (err) {
            setError('Failed to load documents');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // const handleSubCollectionClick = (subCollectionName: string) => {
    //     setSelectedSubCollection(subCollectionName);
    //     // alert(subCollectionName);
    // };

    // Helper to set nested value based on path
    const setNestedValue1 = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = obj;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                current[key] = value;
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        });
    };

    // Helper to delete nested value based on path
    const deleteNestedValue = (obj: any, path: string) => {
        const keys = path.split('.');
        let current = obj;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                delete current[key];
            } else {
                if (!current[key]) return;
                current = current[key];
            }
        });
    };

    const handleFieldChange = (docId: string, path: string, value: any) => {
        setDocuments((prev) => {
            const updatedDoc = { ...prev[docId] };
            setNestedValue1(updatedDoc, path, value);
            setNestedValue(value);
            return { ...prev, [docId]: updatedDoc };
        });
    };

    const handleTypeChange = (field: any, type: any) => {
        setFieldTypes(prevTypes => ({ ...prevTypes, [field]: type }));
    };

    const handleDeleteField = (docId: string, path: string) => {
        setDocuments((prev) => {
            const updatedDoc = { ...prev[docId] };
            deleteNestedValue(updatedDoc, path);
            return { ...prev, [docId]: updatedDoc };
        });
    };

    const handleSave = async (docId: string) => {
        try {
            await updateDocument(name!, docId, documents[docId]);
            toast(`Document "${docId}" updated successfully!`, "ok");
            // alert(`Document "${docId}" updated successfully!`);
            loadDocuments(); // Refresh list
        } catch (err) {
            setError(`Failed to update document "${docId}"`);
            console.error(err);
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!window.confirm(`Are you sure you want to delete "${docId}"?`)) return;
        try {
            await deleteDocument(name!, docId);
            toast(`Document "${docId}" deleted successfully!`, "ok");
            // alert(`Document "${docId}" deleted successfully!`);
            loadDocuments(); // Refresh list
        } catch (err) {
            setError(`Failed to delete document "${docId}"`);
            console.error(err);
        }
    };

    const handleAddNewField = () => {
        if (!nestedPath.trim()) return;
        // alert(typeof nestedValue);
        switch (newSubFieldType) {
            case 'string':
                setNestedValue(convertValue(nestedValue, newSubFieldType));
                setNestedValue1(newDocFields, nestedPath, convertValue(nestedValue, newSubFieldType));
                break;
            case 'number':
                setNestedValue(convertValue(nestedValue, newSubFieldType));
                setNestedValue1(newDocFields, nestedPath, convertValue(nestedValue, newSubFieldType));
                break;
            case 'boolean':
                setNestedValue1(newDocFields, nestedPath, convertValue(nestedValue, newSubFieldType));
                break;
            case 'object':
                setNestedValue1(documents, nestedPath, {});
                break;

        }
        // setNestedValue1(newDocFields, nestedPath, nestedValue);
        // setNestedValue(nestedValue);
        setNestedPath('');
        setNestedValue('');
    };

    const handleAddNewDocument = async () => {

        // const { value: url } = await Swal.fire({
        //     input: "text",
        //     inputLabel: "Document Name",
        //     inputPlaceholder: "Enter document name",
        //     showCancelButton: false,
        //     allowOutsideClick: true,
        //     // inputValidator: (url) => {
        //     //     if (!url) {
        //     //         return "You need to enter something";
        //     //     }
        //     // }
        // });
        // // setTimeout(async () => {
        // if (url) {
        //     setNewDocId(url);
        //     // Swal.fire(`Entered Name: ${url}`);
        //     try {
        //         await createDocument(name!, newDocId, newDocFields);
        //         Swal.fire(`Document "${newDocId}" created successfully!`);
        //         setNewDocId('');
        //         setNewDocFields({});
        //         loadDocuments();
        //     } catch (err) {
        //         setError(`Failed to create document "${newDocId}"`);
        //         console.error(err);
        //         Swal.fire(err as string);
        //     }
        // }

        // }, 5000);
        // return


        // return;
        if (!newDocId.trim()) return;
        try {
            await createDocument(name!, newDocId, newDocFields);
            // alert(`Document "${newDocId}" created successfully!`);
            toast(`Document "${newDocId}" created successfully!`, "ok");
            setNewDocId('');
            setNewDocFields({});
            loadDocuments();
        } catch (err) {
            setError(`Failed to create document "${newDocId}"`);
            console.error(err);
        }
    };

    const handleChangePath = (path: string) => {
        setNestedPath(path);
    }

    const convertValue = (value: any, type: any) => {
        switch (type) {
            case "number":
                return Number(value) || 0;
            case "boolean":
                return value === "true";
            case "array":
                return Array.isArray(value) ? value : [];
            case "subcollection":
                return typeof value === "object" ? value : {};
            default:
                return value.toString();
        }
    };

    const getDefaultValue = (type: any) => {
        switch (type) {
            case "number":
                return 0;
            case "boolean":
                return false;
            case "array":
                return [];
            case "subcollection":
                return {};
            default:
                return "";
        }
    };

    const handle = (value: any) => {
        alert(Boolean(value));
    }

    // Recursive render for nested fields
    const renderFields = (data: any, path = '', docId: string) => {
        return Object.entries(data).map(([key, value], index) => {
            const newPath = path ? `${path}.${key}` : key;

            if (typeof value === 'object' && value !== null) {
                return (
                    <div key={newPath} className="ms-3 mt-2 col-sm-11">
                        {/* <div>{name} {name2} {name3} </div> */}
                        {/* <span
                            className="clickable"
                            onClick={() => navigate(`/collections/${name + '/documents/' + docId + '/' + newPath.replaceAll('.', '/')}`)}
                            // handleSubCollectionClick(name + '/' + docId + '/' + newPath.replaceAll('.', '/'))}

                            style={{ cursor: 'pointer' }}
                        >
                            {key}
                        </span> */}
                        <div className="row">
                            <div className="col-sm-2">
                                <strong>{key}:   </strong>
                            </div>
                            <div className="col-sm-1">
                                <button className="btn btn-primary" onClick={() => {
                                    // alert('select sub collection ' + docId + '.' + key + '.');
                                    handleChangePath(docId + '.' + key + '.');
                                    setNewFieldType('Field');
                                }}>Select</button>
                            </div>
                            <div className="col-sm-1">
                                <button className="btn btn-danger" onClick={() => {
                                    // alert('deleted sub collection');
                                    handleDeleteField(docId, key);
                                }}>X</button>
                            </div>
                        </div>
                        {renderFields(value, newPath, docId)}
                    </div>
                );
            }
            const displayPath = newPath.substring(newPath.indexOf('.') + 1);
            return (
                <div key={newPath} className="row mb-3">
                    {
                        newPath.indexOf('.') > 1 && (
                            <div className="col-sm-1"></div>
                        )
                    }
                    <label className="col-sm-2 col-form-label">{displayPath}:</label>



                    {typeof value === 'number' && (
                        <div className="col-sm-4">
                            <input
                                type="number"
                                className="form-control"
                                value={value}
                                pattern="\d*"
                                inputMode='numeric'
                                onChange={(e) => {
                                    // alert(typeof e.target.value);
                                    handleFieldChange(docId, newPath, convertValue(e.target.value, 'number'));
                                }
                                }
                            />
                        </div>
                    )}

                    {typeof value === 'string' && (
                        // typeof value !== 'boolean' && (
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                value={value as any}
                                onChange={(e) => {
                                    // alert(typeof e.target.value);
                                    handleFieldChange(docId, newPath, e.target.value)
                                }
                                }
                            />
                        </div>
                    )}

                    {typeof value === 'boolean' && (
                        // typeof value !== 'boolean' && (
                        <div className="col-sm-4">
                            <input
                                type="checkbox"
                                className="form-check"
                                value={value as any}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    // alert(e.target.checked);
                                    handleFieldChange(docId, newPath, e.target.checked);
                                }
                                }
                            />
                        </div>
                    )}


                    <div className="col-sm-1">
                        <a>{typeof value}</a>
                    </div>
                    <div className="col-sm-2">
                        <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteField(docId, newPath)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Collection: {name}</h2>

            {/* Existing Documents */}
            <ul className="list-group">
                {Object.entries(documents).map(([docId, fields]) => (
                    <li key={docId} className="list-group-item mb-3 shadow-sm">
                        <div className="row mb-2">
                            <div className="col-sm-2">
                                <h5>{docId}</h5>
                            </div>
                            <div className="col-sm-2">

                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setNewFieldType('Field');
                                        handleChangePath(docId + '.')

                                    }}
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                        {renderFields(fields, '', docId)}

                        <div className="mt-2">
                            <button
                                className="btn btn-success me-2"
                                onClick={() => handleSave(docId)}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteDocument(docId)}
                            >
                                Delete Document
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* New Document */}
            <div className="card mt-4 shadow-sm sticky-bottom">
                <div className="card-body">
                    <div className="row">
                        <h5 className="col-md-2">Add</h5>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={newFieldType}
                                onChange={(e) =>
                                    setNewFieldType(e.target.value) // as 'string') // | 'number' | 'boolean')

                                }
                            >
                                <option value="Document">Document</option>
                                <option value="Field">Field</option>
                                {/* <option value="boolean">Boolean</option> */}
                            </select>
                        </div>
                    </div>



                    {newFieldType === 'Document' && (
                        <div className="row">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={newDocId}
                                    onChange={(e) => setNewDocId(e.target.value)}
                                    placeholder="Document ID"
                                />
                            </div>
                            <div className="col-md-4">
                                <button className="btn btn-primary mt-3" onClick={handleAddNewDocument}>
                                    Create Document
                                </button>
                            </div>
                        </div>

                    )
                    }
                    {newFieldType === 'Field' && (
                        <div>
                            <div className="row">
                                <div className="col-sm-5">
                                    <input
                                        type="text"
                                        value={nestedPath}
                                        onChange={(e) => setNestedPath(e.target.value)}
                                        placeholder="Path (e.g., parent.child.key)"
                                        className="form-control"
                                    />
                                </div>
                                {newSubFieldType === 'number' && (
                                    <div className="col-sm-4">
                                        <input
                                            type="number"
                                            value={nestedValue}
                                            pattern="\d*"
                                            inputMode='numeric'
                                            onChange={(e) => {

                                                // setNestedValue(nestedValue);
                                                setNestedValue(convertValue(e.target.value, 'number'));
                                                // setNestedValue1(documents, nestedPath, nestedValue);
                                                setNestedValue1(documents, nestedPath, convertValue(e.target.value, 'number'));
                                            }
                                            }
                                            placeholder="Value"
                                            className="form-control"
                                        />
                                    </div>
                                )}
                                {newSubFieldType === 'boolean' && (
                                    <div className="col-sm-4">
                                        <input
                                            className="form-check"
                                            type="checkbox"
                                            value={nestedValue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                                                // setNestedValue(nestedValue);
                                                setNestedValue(e.target.checked);
                                                // setNestedValue1(documents, nestedPath, nestedValue);
                                                setNestedValue1(documents, nestedPath, e.target.checked);
                                            }
                                            }
                                            placeholder="Value"
                                        />
                                    </div>
                                )}

                                {newSubFieldType === 'string' && (
                                    <div className="col-sm-4">
                                        <input
                                            type="text"
                                            value={nestedValue}
                                            onChange={(e) => {

                                                // setNestedValue(nestedValue);
                                                setNestedValue(convertValue(e.target.value, newSubFieldType));
                                                // setNestedValue1(documents, nestedPath, nestedValue);
                                                setNestedValue1(documents, nestedPath, convertValue(e.target.value, newSubFieldType));
                                            }
                                            }
                                            placeholder="Value"
                                            className="form-control"
                                        />
                                    </div>
                                )}




                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={newSubFieldType}
                                        onChange={(e) =>
                                            setNewSubFieldType(e.target.value) // as 'string') // | 'number' | 'boolean')

                                        }
                                    >
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="object">Object</option>
                                        {/* <option value="array">Array</option>
                                        <option value="subcollection">Sub Collection</option>  */}
                                    </select>
                                </div>
                                <div className="col-sm-3">
                                    <button className="btn btn-primary" onClick={handleAddNewField}>
                                        Add Field
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}


                </div>
            </div>

            {/* Render nested CollectionDetail if a subcollection is selected
            {selectedSubCollection && (
                <CollectionDetail collectionName={selectedSubCollection} />
            )} */}

        </div>
    );
}
