import { useParams } from "react-router-dom";
// import DocumentsList from "./DocumentsList";

export const CollectionWrapper = () => {
    const { path = "" } = useParams<{ path: string }>();
    const decodedPath = path.replace(/\/$/, ""); // remove trailing slash if needed

    // return <DocumentsList collectionPath={decodedPath} />;
};
