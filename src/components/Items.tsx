import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, updateDocument } from '../services/api';

export default function EditDocument() {
    const { name, docId } = useParams<{ name: string; docId: string }>();
    const [documentData, setDocumentData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (name && docId) {
            loadDocument();
        }
    }, [name, docId]);

    const loadDocument = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDocument(name!, docId!);
            setDocumentData(data);
        } catch (err) {
            setError('Failed to load document');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setDocumentData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        if (!name || !docId) return;
        try {
            await updateDocument(name, docId, documentData);
            alert('Document updated successfully!');
        } catch (err) {
            setError('Failed to update document');
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Edit Document: {docId}</h2>

            <div className="space-y-4">
                {Object.entries(documentData).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                        <label className="w-32 font-semibold">{key}</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Save Changes
            </button>
        </div>
    );
}
