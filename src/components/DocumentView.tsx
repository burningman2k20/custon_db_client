import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { DocumentType, getDocuments, toast, updateDocument } from "../services/api"
import { Button, Col, FloatingLabel, Form, Row, Table } from "react-bootstrap";
import { render } from "@testing-library/react";
import { set } from "lodash";

export const DocumentView = () => {
    const { collectionName, documentName } = useParams<{ collectionName: string, documentName: string }>()
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});
    const [docs, setDocs] = useState<Record<string, DocumentType>>({});

    const [collectionPath, setCollectionPath] = useState("")
    const [fetch, setFetch] = useState(true);
    const [loading, setLoading] = useState(false);

    const [documentPath, setDocumentPath] = useState(documentName!)

    const [data, setData] = useState<any>();
    // var documentPath = documentName!

    const navigate = useNavigate();

    useEffect(() => {
        if (!fetch) return;
        fetchDocuments();
    }, [fetch]);

    // Helper: Get value from path
    const getValueFromPath = (obj: any, path: string) => {
        return path.split(".").reduce((acc, key) => {
            const k = isNaN(Number(key)) ? key : Number(key);
            return acc?.[k];
        }, obj);
    };

    // Helper: Set value at path
    const setValueAtPath = (main: boolean = false, obj: any, path: string, value: any) => {
        const keys = path.split(".");
        // const newData = { ...obj };
        const newData = structuredClone(obj);

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
        if (main) {
            // setDocumentPath();
            setDocuments(newData);
            // alert(documentPath);
        } else {
            setDocs(newData)

        }

        return newData;
    };

    function deleteValueAtPath(main: boolean = false, obj: any, path: string): void {
        const keys = path.split(".");

        const newData = { ...obj };
        // const newData = structuredClone(obj);

        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
            if (!current) return;
        }

        delete current[keys[keys.length - 1]];
        // setDocuments(removeNullObjects(newData));
        if (main) {
            // alert(documentPath)
            setDocuments(newData);
        } else {
            setDocs(newData)
        }

        // setDocuments(newData);
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

    const fetchDocuments = async () => {
        try {
            // const res = await axios.get(`http://localhost:5000/collections/${collectionName}`);
            // setDocuments(res.data);
            setLoading(true);
            const data = await getDocuments(collectionName!);
            setDocuments(data);
            setDocs(getValueFromPath(data, documentPath.replace('/', '.')));
            setFetch(false);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching documents", error);
            toast("Error fetching documents", "error");
        }
    };
    if (documentName === undefined) {
        return (
            <>
                <div>no document to display</div>
            </>
        )
    }

    const removeLastSegment = (path: string, separator: string = "/") => {
        const parts = path.split(separator);
        parts.pop(); // removes last item
        return parts.join(separator);
    };

    const handleFieldChange = (field: string, value: any) => {
        // alert(documentPath + `.${field}`)
        // alert(value)
        setValueAtPath(false, docs, `${field}`, value);
        setValueAtPath(true, documents, documentPath + `.${field}`, value);

        // setDocs((prevDocs) => ({
        //     ...prevDocs,
        //     [documentName]: { ...prevDocs[documentName], [field]: value },
        // }));
    }

    const handleFieldDelete = (field: string) => {
        // alert(documentPath + `.${field}`)


        // alert(getValueFromPath(docs, `${field}`))
        deleteValueAtPath(false, docs, `${field}`)
        deleteValueAtPath(true, documents, documentPath + `.${field}`)
    }

    const renderField = (field: string, value: any) => {
        // var val = value;
        return (
            <>

                {typeof value === 'string' && (
                    <>
                        <td>
                            {/* <Form.Group> */}
                            <Form.Label>{field}</Form.Label>
                        </td>
                        <td>
                            {typeof value}
                        </td>
                        <td>
                            <Form.Control
                                value={value}
                                type="text"
                                onChange={(e) => handleFieldChange(field, `${e.target.value}`)}
                                onKeyDown={(e) => {
                                    // if (e.key === "Enter") {
                                    //     alert(documentPath + `.${field}`)
                                    //     alert(value)
                                    //     // setValueAtPath(documents, documentPath + `.${field}`, value);
                                    // }
                                }}
                            >
                            </Form.Control>
                            {/* </Form.Group> */}
                        </td>

                        <td>
                            <Button className="btn btn-danger btn-sm" onClick={() => { handleFieldDelete(field) }}>Delete</Button>
                            {/* <Button className="btn btn-primary btn-sm" onClick={() => {
                                alert(documentPath + `.${field}`)
                            }}>view</Button> */}
                        </td>
                    </>
                )}
                {typeof value === 'boolean' && (
                    <>
                        <td>
                            {/* <Form.Group> */}
                            <Form.Label>{field}</Form.Label>
                        </td>
                        <td>
                            {typeof value}
                        </td>
                        <td>
                            <Form.Check
                                checked={value as boolean}
                                type="switch">

                            </Form.Check>
                            {/* </Form.Group> */}
                        </td>

                        <td>
                            <Button className="btn btn-danger btn-sm">Delete</Button>
                            {/* <Button className="btn btn-primary btn-sm" onClick={() => {
                                alert(documentPath + `.${field}`)
                            }}>view</Button> */}
                        </td>
                    </>
                )}
                {typeof value === 'number' && (
                    <>
                        <td>
                            {/* <Form.Group> */}
                            <Form.Label>{field}</Form.Label>
                        </td>
                        <td>
                            {typeof value}
                        </td>
                        <td>
                            <Form.Control
                                value={value as number}
                                type="number">

                            </Form.Control>
                            {/* </Form.Group> */}
                        </td>

                        <td>
                            <Button className="btn btn-danger btn-sm">Delete</Button>
                            {/* <Button className="btn btn-primary btn-sm" onClick={() => {
                                alert(documentPath + `.${field}`)
                            }}>view</Button> */}
                        </td>

                    </>
                )}
                {/* <div>{field} {String(value)} {typeof value}</div> */}

            </>
        )
    }

    if (loading) {
        return (
            <>
                Loading...
            </>
        )
    }

    const returnObjectCount = () => {
        var count = 0;
        Object.entries(docs).map(([field, doc], index) => {
            if (typeof (doc) === 'object') count++;
        }
        )
        return count;
    }

    // alert(documentName)
    return (
        <div className="container mt-4">
            <div className="card shadow-lg">
                <div className="card-header d-flex justify-content-between">
                    <h5>Document Details</h5>
                    <Button className="btn btn-primary btn-sm" onClick={() => {
                        if (documentPath !== documentName) {
                            setDocumentPath(removeLastSegment(documentPath, '.'));
                            setFetch(true)
                        } else {
                            window.history.back();
                        }

                    }}>Back</Button>


                </div>
                <div className="card-body mb-1">
                    <div className="d-flex justify-content-between">
                        <h5>Collection:</h5>{collectionName}
                    </div>
                    <div className="d-flex justify-content-between">
                        <h5>Document Name:</h5>{documentName}
                    </div>

                    {/* <div className="card-footer">
                        
                    </div> */}
                </div>

            </div>
            {/* <div>{documentPath.replace('/', '.')}</div> */}

            <br />



            {/* <div className="card">
            {(docs !== null && docs !== undefined) && Object.entries(docs).map(([field, doc], index) => (
                <>
                    {typeof doc === 'object' && (
                        
                )}
                    </>
            ))}
            </div> */}
            <div className="card">
                <div className="card-title">
                    <div className="d-flex justify-content-between">
                        {/* <h5 className="m-4">Document Data</h5> */}
                        <div className="m-3 fw-bold">Object Path:<div className="fw-normal">{documentPath.replace('.', '/')}</div></div>
                        {/* <div>{typeof getValueFromPath(documents, documentPath) === 'object' && !Array.isArray(getValueFromPath(documents, documentPath)) && (
                            <div className="m-3">
                                <div><strong>Type: </strong>Object</div>
                                <div><strong>Object Path: </strong>{documentPath.replace('.', '/')}</div>
                            </div>
                        )}</div>
                        <div>{typeof getValueFromPath(documents, documentPath) === 'object' && Array.isArray(getValueFromPath(documents, documentPath)) && (
                            <>
                                <div><strong>Type: </strong>Array</div>
                                <div><strong>Array Path:</strong>{documentPath.replace('.', '/')}</div>
                            </>
                        )}</div> */}
                        <div className="m-4 d-flex justify-content-end">

                            <Button className="btn btn-success btn-sm" onClick={async () => {
                                await updateDocument(collectionName!, documentName, documents[documentName])
                                setFetch(true);
                                toast("document updated", "ok")
                            }}>Save</Button>

                        </div>

                    </div>

                </div>

                {returnObjectCount() > 0 && (
                    <Table bordered striped hover >
                        <thead className="sticky-top pad-under-navbar m-4">
                            <tr>
                                <th>Name</th>
                                <th>Type</th>

                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {(docs !== null && docs !== undefined) && Object.entries(docs).map(([field, doc], index) => (
                                <>
                                    {typeof doc === 'object' && (
                                        <>
                                            <tr>
                                                <td>{field} </td>
                                                {Array.isArray(doc) ? (
                                                    <td>Array</td>
                                                ) : (
                                                    <td>Object</td>
                                                )}



                                                <td>
                                                    <Button className="btn btn-danger btn-sm">Delete</Button>
                                                    <Button key={field} className="btn btn-primary btn-sm" onClick={async () => {

                                                        // Split path and remove any empty segments
                                                        const currentSegments = collectionPath.split("/").filter(Boolean);

                                                        // Prevent duplicate if docName already in path
                                                        if (currentSegments[currentSegments.length - 1] === field) return;

                                                        const newPath = [...currentSegments, field].join(".");

                                                        if (typeof doc === 'object' && !Array.isArray(doc)) {
                                                            setDocumentPath(documentPath + '.' + newPath);
                                                            setFetch(true);
                                                            setDocs(getValueFromPath(documents, documentPath))
                                                            setData('')
                                                        }
                                                        else if (typeof doc === 'object' && Array.isArray(doc)) {
                                                            setDocumentPath(documentPath + '.' + newPath);
                                                            setFetch(true);
                                                            setDocs(getValueFromPath(documents, documentPath))
                                                            setData('')
                                                        }

                                                    }}>
                                                        View
                                                    </Button>
                                                </td>

                                            </tr>
                                        </>
                                    )}

                                </>
                            ))}

                        </tbody>
                    </Table>
                )}

                <Table bordered striped hover >
                    <thead className="sticky-top pad-under-navbar mt-4">
                        <tr>
                            <th>Field/Index</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>

                        {(docs !== null && docs !== undefined) && Object.entries(docs).map(([field, doc], index) => (
                            <>
                                {typeof doc !== 'object' && (
                                    <tr>
                                        {/* {typeof doc === 'object' && (
                        <div>{doc[documentName]}</div>
                    )
                    } */}
                                        {/* {typeof doc !== 'object' && (
                        setData(getValueFromPath(documents, documentPath + `.${field}`))
                    )} */}

                                        {typeof doc !== 'object' && (
                                            <>

                                                {renderField(field, doc)}

                                            </>
                                        )
                                        }

                                    </tr>
                                )}

                            </>
                        ))
                        }

                    </tbody>
                </Table>
                <div className="card sticky-bottom">
                    <div className="card-title">
                        Add New Object
                    </div>
                    <div className="card-body">
                        <Form>
                            <Row>
                                <Form.Group as={Col}>
                                    <Col>
                                        <FloatingLabel
                                            controlId="floatingInput1"
                                            label="Field Name"
                                            className="mb-3"
                                        >
                                            <Form.Control type="text" />
                                        </FloatingLabel>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Col}>

                                    <FloatingLabel
                                        controlId="floatingInput2"
                                        label="Field Value"
                                        className="mb-3"
                                    >
                                        <Form.Control type="text" />
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Select aria-label="Default select example">
                                        <option>Open this select menu</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>


                                </Form.Group>
                                <Col>
                                    <Button onClick={() => {
                                        alert(documentPath);
                                    }}>Add</Button>

                                </Col>
                            </Row>
                        </Form>
                    </div>

                </div>
            </div >
        </div>
    )
}