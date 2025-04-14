import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

export function Home() {
    const navigate = useNavigate();
    // navigate('dashboard');
    const { user, logout } = useAuth();
    return (
        (user ? (
            <>
                {navigate('/dashboard')}
            </>

        ) : (
            <div>
                Home Page
            </div>
        ))

    )
}