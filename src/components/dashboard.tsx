import { useNavigate } from "react-router-dom"

export function Dashboard() {

    const navigate = useNavigate();

    return (
        <div className="container mt-4">
            <h2>DashBoard</h2>

            <button className="btn btn-primary" onClick={() => navigate('/storage')}>Storage</button>
            <button className="btn btn-primary" onClick={() => navigate('/collections')}>Collections</button>
        </div>
    )
}