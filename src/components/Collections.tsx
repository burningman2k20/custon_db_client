import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollections, createCollection, deleteCollection } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { toast } from '../services/api';

export default function Collections() {
    const [collections, setCollections] = useState<string[]>([]);
    const [newCollection, setNewCollection] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const user = useAuth();


    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCollections();
            setCollections(data);
        } catch (err) {
            setError('Failed to load collections');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollection.trim()) return;
        try {
            await createCollection(newCollection);
            setNewCollection('');
            loadCollections(); // Refresh collections
            // alert(`Collection "${newCollection}" created successfully!`);
            toast(`Collection "${newCollection}" created successfully!`, "ok");
        } catch (err) {
            setError(`Failed to create collection "${newCollection}"`);
            console.error(err);
        }
    };

    const handleDeleteCollection = async (name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteCollection(name);
            loadCollections(); // Refresh collections
            // alert(`Collection "${name}" deleted successfully!`);
            toast(`Collection "${name}" deleted successfully!`, "ok");
        } catch (err) {
            setError(`Failed to delete collection "${name}"`);
            console.error(err);
        }
    };

    if (loading) return <div className="alert alert-info">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Collections</h2>

            {/* Create New Collection */}
            <div className="card m-lg-5 shadow-lg">
                <div className="card-body">
                    <h5 className="card-title">Create New Collection</h5>
                    <div className="row">
                        <div className="col-sm-10">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Collection Name"
                                value={newCollection}
                                onChange={(e) => setNewCollection(e.target.value)}
                            />
                        </div>
                        <div className="col-sm-2">
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleCreateCollection}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Collections */}
            <ul className="list-group m-lg-5">
                {collections.map((name) => (
                    <li
                        key={name}
                        className="list-group-item d-flex justify-content-between align-items-center shadow-sm"
                    >
                        <span
                            className="clickable"
                            onClick={() => navigate(`/collections/${name}/`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {name}
                        </span>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCollection(name)}
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
