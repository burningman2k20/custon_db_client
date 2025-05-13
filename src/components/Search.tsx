import React, { useEffect, useState } from "react";
import Fuse, { FuseResult } from "fuse.js";
import { getCollections, getDocuments, toast } from "../services/api";
import { Breadcrumb, BreadcrumbItem, Button, Card, FloatingLabel, Form } from "react-bootstrap";
import { api } from "../services/AuthService";


const Search = () => {
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MatchResult[]>([]);
    const [fetch, setfetch] = useState(true);
    const [collections, setCollections] = useState<string[]>([])

    const [grouped, setGrouped] = useState<Record<string, MatchResult[]>>(); //Record<string, MatchResult[]> = {};

    const [selectedCollection, setSelectedCollection] = useState("");

    useEffect(() => {
        if (!fetch) return;
        fetchDocuments();
    }, [fetch]);

    const fetchDocuments = async () => {
        try {
            // const res = await axios.get(`http://localhost:5000/collections/${collectionName}`);
            // setDocuments(res.data);
            // setLoading(true);
            const data = await getCollections();
            setCollections(data);
            // if (selectedCollection === '' || selectedCollection === undefined)
            setSelectedCollection(data[0]);
            // console.log(data);
            collections.forEach(item => {

            })
            // const data1 = await getDocuments('users', '/documents');
            // setDocuments(data1)
            // console.log(data1);
            // setDocuments(removeNullObjects(data));
            // setDocs(getValueFromPath(data, documentPath.replace('/', '.')));
            // setFetch(false);
            // setLoading(false);
        } catch (error) {
            console.error("Error fetching documents", error);
            toast("Error fetching documents", "error");
        }
    };


    const [searchTerm, setSearchTerm] = useState("");

    function groupResultsByDocument(results: MatchResult[]) {
        const grouped: Record<string, MatchResult[]> = {};

        for (const result of results) {
            const docId = result.path[0]; // first item is document ID
            if (!grouped[docId]) grouped[docId] = [];
            grouped[docId].push(result);
        }

        return grouped;
    }

    const searchJsonForTerm1 = (obj: any, term: string) => {
        var path = ""
        Object.entries(obj).map((field, value, index) => {
            // console.log(field[value])
            if (field[value]) {
                console.log(field[value])
            }
            // if (field[value] === term) {
            //     path += field + '.';
            //     console.log(field[value]);
            // }
        })
    }

    type MatchResult = {
        docId: string;
        path: string[];
        key: string;
        value: any;
    };

    type PathMatch = { path: string[]; key: string; value: any };

    function searchJsonForTerm(
        obj: any,
        term: string,
        currentPath: string[] = []
    ): PathMatch[] {
        const results: PathMatch[] = [];

        const lowerTerm = term.toLowerCase();

        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                results.push(...searchJsonForTerm(item, term, [...currentPath, index.toString()]));
            });
        } else if (typeof obj === "object" && obj !== null) {
            for (const key in obj) {
                const value = obj[key];
                const path = [...currentPath, key];

                // Check if the key matches
                if (key.toLowerCase().includes(term.toLowerCase())) {
                    results.push({ path: currentPath, key, value });
                }

                // currentPath.forEach((item, index) => {
                //     if (item.toLowerCase().includes(term.toLowerCase())) {
                //         results.push({ path: currentPath, key, value });
                //     }
                // })

                // if (currentPath.join('/').toLowerCase().includes(term.toLowerCase())) {
                //     results.push({ path: currentPath, key, value });
                // }

                // Match strings or convert primitives to string
                if (
                    typeof value === "string" &&
                    value.toLowerCase().includes(lowerTerm)
                ) {
                    results.push({ path, key, value });
                } else if (["number", "boolean"].includes(typeof value)) {
                    if (value.toString().includes(term)) {
                        results.push({ path, key, value });
                    }
                }

                // Continue recursion
                if (typeof value === "object") {
                    results.push(...searchJsonForTerm(value, term, path));
                }
                // if (Array.isArray(value)) {
                //     // results.push(...searchJsonForTerm(value, term, path));
                // }
            }
        }

        return results;
    }


    const highlightMatch = (text: string, term: string) => {
        // alert('|' + text + '|')
        if (term === '') return
        const parts = text.split(new RegExp(`(${term})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === term.toLowerCase() ? (
                <mark style={{ background: "lightblue" }} key={i}>{part}</mark>
            ) : (
                part
            )
        );
    }

    function searchRecordForTerm(
        record: Record<string, DocumentType>,
        term: string
    ): MatchResult[] {
        const allResults: MatchResult[] = [];
        const lowerTerm = term.toLowerCase();

        setfetch(true)

        // for (const docId in record) {
        //     const doc = record[docId];
        //     const matches = searchJsonForTerm(record, lowerTerm);
        //     matches.forEach((m) => {
        //         allResults.push({doc, ...m });
        //     });
        // }
        // for (const docId in record) {
        //     if (searchTerm.includes(lowerTerm)) {
        //         allResults.push({ docId:docId, path:new String[], key:'key', value:'value'  });
        //         // results.push({ path, key, value });
        //     }
        //     // console.log(docId)
        //     // const doc = record[docId];
        //     // const matches = searchJsonForTerm(doc, lowerTerm);
        //     // matches.forEach((m) => {

        //     // });
        // }

        for (const docId in record) {
            // console.log(docId)
            const doc = record[docId];

            // Match document ID
            if (docId.toLowerCase().includes(term.toLowerCase())) {
                allResults.push({
                    docId: docId,
                    path: [docId],
                    key: '',
                    value: docId,
                });
            }
            const matches = searchJsonForTerm(doc, lowerTerm, [docId]);
            matches.forEach((m) => {
                allResults.push({ docId, ...m });
            });
        }

        return allResults;
    }

    const [searchResults, setSearchResults] = useState([]);

    const handleServerSideSearch = async () => {
        if (searchTerm.length < 4) return;
        const res = await api.get("/search", {
            params: { term: searchTerm }
            // headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
        // console.log(res.data)
    };

    const handleSearch = async () => {
        if (searchTerm === '') return
        if (selectedCollection === undefined) setSelectedCollection(collections[0]);
        // alert(selectedCollection)

        // collections.forEach(async item => {
        // alert(item)
        setResults([])
        const data = await getDocuments(`${selectedCollection}`, "/documents");

        const res = searchRecordForTerm(data, searchTerm)
        // if (res.length > 0) {

        setResults(searchRecordForTerm(data, searchTerm))
        setGrouped(groupResultsByDocument(res));

        // }

        // })

    };

    const removeFirstSegment = (path: string, separator: string = ".") => {
        const parts = path.split(separator);
        parts.splice(0, 1);
        return parts.join(separator);
    };



    return (
        <>
            <div className="container m-4">
                <Card>
                    <Card.Header>
                        <Card.Title>
                            <div className="d-flex justify-content-between">
                                Search
                                <Button className="btn btn-primary btn-sm mx-2" onClick={() => {
                                    // if (documentPath !== documentName) {
                                    // setDocumentPath(removeLastSegment(documentPath, '.'));
                                    // setFetch(true)
                                    // } else {
                                    window.history.back();
                                    // }

                                }}>Back</Button>
                            </div>

                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group>
                            <FloatingLabel
                                controlId="floatingInput1"
                                label="Collection"
                                className="mb-3"
                            >
                                <Form.Select
                                    aria-label="Default select example"
                                    value={selectedCollection}
                                    onChange={(e) => {
                                        setSelectedCollection(e.currentTarget.value)
                                        // alert(e.currentTarget.value)
                                    }}>

                                    {collections.map((value) => (
                                        <option value={value}>{value}</option>
                                    ))}

                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel
                                controlId="floatingInput1"
                                label="Search Terms"
                                className="mb-3"
                            >
                                <Form.Control
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.currentTarget.value);
                                    }}
                                    placeholder="Search"
                                />
                            </FloatingLabel>
                            {/* <input
                className="form-control mb-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
            /> */}
                            <Button className="btn btn-primary mb-3" onClick={handleSearch}>Client Side Search</Button>
                            {/* <Button className="btn btn-primary mb-3" onClick={handleServerSideSearch}>Server Side Search</Button> */}
                        </Form.Group>
                    </Card.Body>
                </Card>
                {/* 
                <div className="container mt-3">
                    {searchResults && Object.entries(searchResults).map(([res, idx]) => (
                        <div key={res} className="mb-3">
                            <strong> [Collection {res}]</strong>
                            <ul>


                                {Object.entries(idx).map((match: any, i: number) => (
                                    <li key={i}>
                                        {match.map((item: any, index: any) => (
                                            <>
                                                {removeFirstSegment(String(item.path), '.')} - {item.key} - {item.value}
                                            </>
                                        ))}
                                      
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div> */}

                <div className="container mt-3">
                    <h5>Grouped Search Results</h5>
                    {grouped && Object.entries(grouped).map(([docId, matches]) => (
                        <div key={docId} className="mb-4">
                            <h6 className="bg-light p-2 border rounded">Document: {highlightMatch(docId, searchTerm)}</h6>
                            {matches.map((match, idx) => (
                                <div key={idx} className="card p-2 mb-2">
                                    <div>
                                        <strong>Path:</strong> {match.path.join(" › ")}
                                    </div>
                                    <div>
                                        <strong>Key:</strong> {highlightMatch(match.key, searchTerm)}
                                    </div>
                                    <div>
                                        <strong>Value:</strong>{" "}
                                        {typeof match.value === "string"
                                            ? highlightMatch(match.value, searchTerm)
                                            : JSON.stringify(match.value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>


                {/* <div>
                    <h5>Results</h5>
                    {results.map((result, index) => (
                        <div key={index} className="card mb-2 p-2">
                            <div className="card-header">
                            </div>
                            <div className="card-body"><strong>Value:</strong> {highlightMatch(JSON.stringify(result.value), searchTerm)}
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>
        </>
    );
};

export default Search;
