import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login, logout, signUp } from '../services/AuthService';

// 👉 Define Auth Context Type
interface AuthContextType {
    user: { email: string } | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));


    // Load user from token on mount (persistent login)
    useEffect(() => {
        if (token) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
    }, [token]);

    // 👉 Login function
    const handleLogin = async (email: string, password: string) => {
        const response = await login(email, password);
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
    };

    // 👉 Signup function
    const handleSignUp = async (email: string, password: string) => {
        const response = await signUp(email, password);
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
    };

    // 👉 Logout function
    const handleLogout = () => {
        logout();
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login: handleLogin, signUp: handleSignUp, logout: handleLogout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
