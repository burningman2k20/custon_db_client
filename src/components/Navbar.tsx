import { useAuth } from "../context/AuthContext";
import { Profile } from "./Profile";

function Navbar() {
    const { user, logout } = useAuth();

    const displayName = localStorage.getItem('user');
    // alert(displayName)

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark my-navbar sticky-top" >
            <div className="container-fluid">
                <a className="navbar-brand">
                    Custom Rest API Database
                </a>
                {user && (
                    // <Profile />
                    <a href="/profile" className="user-header">User : {user.displayName}</a>
                )}

                <div className="d-flex">
                    {user ? (
                        <>
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <a className="nav-link" href="/dashboard">
                                        Dashboard
                                    </a>
                                </li>

                            </ul>

                            <button className="btn btn-outline-light" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a className="btn btn-outline-light me-2" href="/login">
                                Login
                            </a>
                            <a className="btn btn-outline-light" href="/signup">
                                Signup
                            </a>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
export default Navbar;