import axios from "axios";
import { api } from './AuthService'
import Swal from "sweetalert2";

export const API_URL = "https://custon-db-rest-api-297546668637.us-central1.run.app/collections/"
// "http://10.0.0.202:3000/collections/"; // Update this if needed


// export const getCollections = async () => {
//     const response = await axios.get(`${API_URL}`);
//     return response.data;
// };


// 👉 Fetch user collections (Authenticated)
export const getCollections = async () => {
    const response = await api.get('collections');
    return response.data;
};

export const getDocument = async (collection: string, docId: string) => {
    const response = await api.get(`${API_URL}${collection}/documents/${docId}`);
    return response.data;
};

export const getDocuments = async (collection: string) => {
    const response = await api.get(`${API_URL}${collection}/documents`);
    return response.data;
};

export const createDocument = async (collection: string, docId: string, data: object) => {
    await api.post(`${API_URL}${collection}/documents/${docId}`, data);
};

export const updateDocument = async (collection: string, docId: string, data: object) => {
    await api.put(`${API_URL}${collection}/documents/${docId}`, data);
};

export const deleteDocument = async (collection: string, docId: string) => {
    await api.delete(`${API_URL}${collection}/documents/${docId}`);
};

// export const getCollections = async () => {
//     const response = await axios.get(API_URL);
//     return response.data;
// };

export const createCollection = async (name: string) => {
    await api.post(`${API_URL}${name}`, {});
};

export const deleteCollection = async (name: string) => {
    await api.delete(`${API_URL}${name}`, {});
    // const res = await fetch(`/api/collections/${name}`, {
    //     method: 'DELETE',
    // });
    // if (!res.ok) throw new Error(`Failed to delete collection "${name}"`);
};

// Rename a collection
export const renameCollection = async (oldName: string, newName: string) => {
    const res = await fetch(`${API_URL}${oldName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
    });
    if (!res.ok) throw new Error(`Failed to rename collection "${oldName}"`);
};
// export const getItems = async (collectionName: string) => {
//     const response = await axios.get(`${API_URL}${collectionName}/items`);
//     return response.data;
// };

// export const addItem = async (collectionName: string, itemName: string) => {
//     await axios.post(`${API_URL}${collectionName}/items`, { name: itemName });
// };

// export const deleteItem = async (collectionName: string, itemId: number) => {
//     await axios.delete(`${API_URL}${collectionName}/items/${itemId}`);
// };

export const toast = async (message: string = "", type: string = "success") => {

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    if (type == 'ok') Toast.fire({
        icon: 'success',
        title: message
    });
    if (type == "error") Toast.fire({ icon: 'error', title: message });
}
