import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand">
                    Custom Rest API Database
                </a>
                {user && (
                    <p className="user-header">User : {user.email}</p>
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
                                {/* <li className="nav-item">
                                    <a className="nav-link" href="/storage">
                                        Storage
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/collections/">
                                        Collections
                                    </a>
                                </li> */}
                            </ul>
                            {/* <span className="navbar-text me-3">Hello, {user.email}</span> */}
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