import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react/jsx-runtime';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
}
