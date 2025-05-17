import axios from 'axios';
import { AUTH_URL } from './api'

export const API_URL = //"https://custon-db-rest-api-dxmw-iz0nq4yb3-davids-projects-f38fd2f8.vercel.app/"
    //"https://db-service-145948873972.northamerica-northeast1.run.app/"
    //"https://custon-db-rest-api-297546668637.us-central1.run.app/"
    // 'http://10.0.0.202:3000/';
    // "http://127.0.0.1/";
    "https://custon-db-rest-api.onrender.com/"

// export const login = async (email: string, password: string) => {
//     const res = await axios.post(`${API_URL}/login`, { email, password });
//     return res.data;
// };

// 👉 Axios instance with authentication header
export const api = axios.create({
    baseURL: API_URL,
});

// 👉 Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 👉 Helper function to get the auth token
const getAuthToken = () => {
    return localStorage.getItem('token'); // or sessionStorage.getItem('token');
};

// 👉 Save token in localStorage
const saveAuthToken = (token: string) => {
    localStorage.setItem('token', token);
};

// 👉 Login
export const login = async (email: string, password: string) => {
    const response = await api.post(`${AUTH_URL}login`, { email, password });
    saveAuthToken(response.data.token);
    return response.data;
};

// export const signup = async (email: string, password: string) => {
//     const res = await axios.post(`${API_URL}/signup`, { email, password });
//     return res.data;
// };

// 👉 Sign Up
export const signUp = async (email: string, password: string) => {
    const response = await api.post(`${AUTH_URL}signup`, { email, password });
    saveAuthToken(response.data.token);
    return response.data;
};

export const logout = async () => {
    localStorage.removeItem('token');
    await api.post(`${AUTH_URL}logout`);
};

export const getCurrentUser = async () => {
    const res = await api.get(`${AUTH_URL}me`);
    return res.data;
};
