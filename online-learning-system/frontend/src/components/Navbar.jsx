
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {

    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-xl learnhub-navbar sticky-top">
            <div className="container-fluid learnhub-container">

                {/* Brand */}
                <Link className="navbar-brand learnhub-brand" to="/">
                    <span className="brand-icon">
                        <i className="bi bi-mortarboard-fill"></i>
                    </span>
                    <span>Learn<span>Hub</span></span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler learnhub-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Content */}
                <div className="collapse navbar-collapse" id="mainNavbar">

                    {/* Navigation Links */}
                    <ul className="navbar-nav learnhub-nav mx-auto">

                        <li className="nav-item">
                            <NavLink
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                                to="/"
                            >
                                Home
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/#courses">
                                Courses
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/#categories">
                                Categories
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/#about">
                                About Us
                            </a>
                        </li>

                    </ul>

                    {/* Authentication Section */}
                    <div className="learnhub-actions">

                        {isAuthenticated ? (
                            <>
                                {/* User Welcome */}
                                <div className="user-welcome">
                                    <div className="user-avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() ||
                                            user?.email?.charAt(0)?.toUpperCase() ||
                                            "U"}
                                    </div>

                                    <div className="user-info">
                                        <span className="welcome-label">
                                            Welcome back
                                        </span>
                                        <span className="welcome-name">
                                            {user?.name || user?.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Profile */}
                                <Link
                                    to="/profile"
                                    className="profile-nav-btn"
                                >
                                    <i className="bi bi-person-circle"></i>
                                    <span>Profile</span>
                                </Link>

                                {/* Logout */}
                                <button
                                    className="logout-nav-btn"
                                    onClick={logout}
                                >
                                    <i className="bi bi-box-arrow-right"></i>
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="login-nav-btn"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="register-nav-btn"
                                >
                                    Get Started
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </>
                        )}

                    </div>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;
