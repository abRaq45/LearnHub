
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <h2>LearnHub</h2>
                <span>Admin Panel</span>
            </div>

            <nav className="admin-navigation">
                <p className="admin-nav-label">MAIN MENU</p>

                <NavLink
                    to="/admin/dashboard"
                    end
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>▦</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/courses"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>▤</span>
                    Manage Courses
                </NavLink>

                <NavLink
                    to="/admin/lessons"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>▣</span>
                    Manage Lessons
                </NavLink>

                <NavLink
                    to="/admin/learners"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>♙</span>
                    Manage Learners
                </NavLink>

                <NavLink
                    to="/admin/enrollments"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>▥</span>
                    Manage Enrollments
                </NavLink>
            </nav>

            <div className="admin-sidebar-bottom">
                <NavLink
                    to="/"
                    className="admin-nav-link"
                >
                    <span>⌂</span>
                    View Website
                </NavLink>

                <button
                    type="button"
                    className="admin-nav-link admin-logout"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;
