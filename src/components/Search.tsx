import React, { useEffect, useState } from "react";
import Fuse, { FuseResult } from "fuse.js";
import { getCollections, getDocuments, toast } from "../services/api";
import { Breadcrumb, BreadcrumbItem, FloatingLabel, Form } from "react-bootstrap";


const Search = () => {
    const [documents, setDocuments] = useState<Record<string, DocumentType>>({});
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MatchResult[]>([]);
    const [fetch, setfetch] = useState(true);
    const [collections, setCollections] = useState<string[]>([])

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
            // console.log(data);
            collections.forEach(item => {

            })
            const data1 = await getDocuments('users', '/documents');
            setDocuments(data1)
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

    function searchRecordForTerm(
        record: Record<string, DocumentType>,
        term: string
    ): MatchResult[] {
        const allResults: MatchResult[] = [];
        const lowerTerm = term.toLowerCase();

        for (const docId in record) {
            const doc = record[docId];
            const matches = searchJsonForTerm(doc, lowerTerm);
            matches.forEach((m) => {
                allResults.push({ docId, ...m });
            });
        }

        return allResults;
    }

    const handleSearch = () => {
        if (selectedCollection === '') setSelectedCollection(collections[0]);
        collections.forEach(async item => {
            // alert(item)
            setResults([])
            // const data = await getDocuments(item);
            const data = await getDocuments(`${selectedCollection}`, "/documents");
            // setDocuments(data1)
            // setResults(searchJsonForTerm(data, "user"))
            // setResults()
            // const array  = [];
            const res = searchRecordForTerm(data, searchTerm)
            if (res.length > 0) {
                // array.push(res);
                setResults(searchRecordForTerm(data, searchTerm))
                // console.log(searchRecordForTerm(data, searchTerm))
                // setResults(prev => [...prev, res]);
                // alert(searchTerm)
            }
            // setResults(array);
            // setDocuments(data)
            // console.log(data)

            // setResults(searchDocuments(data, searchTerm, collections));
            // console.log(results)
            // setSearchTerm("");
        })

    };



    return (
        <div>
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
                <button className="btn btn-primary mb-3" onClick={handleSearch}>Search</button>
            </Form.Group>

            <div>
                <h5>Results</h5>
                {results.map((result, index) => (
                    <div key={index} className="card mb-2 p-2">
                        <Breadcrumb>
                            <BreadcrumbItem>{result.docId}</BreadcrumbItem>
                            {Object.entries(result.path).map((value, index2) => (
                                <>
                                    <BreadcrumbItem key={index2}>{value}</BreadcrumbItem>
                                </>
                            )

                            )}
                        </Breadcrumb>
                        {/* <div><strong>Path:</strong> {result.path}</div> */}
                        {/* <div><strong>Matched Term:</strong> "{result.term}"</div> */}
                        <div><strong>Value:</strong> {JSON.stringify(result.value)}</div>
                    </div>
                ))}
                {/* {Object.entries(results).map((field, value) => (
                    <>


                    </>
                ))} */}

                {/* <pre>{JSON.stringify(results, null, 2)}</pre> */}
            </div>
        </div>
    );
};

export default Search;
