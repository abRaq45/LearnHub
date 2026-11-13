import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {

    const { user, isAuthenticated } = useAuth();

    // Check authentication
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Normalize role
    const userRole = user.role
        ?.toUpperCase()
        .replace("ROLE_", "");

    // Check authorization
    if (
        allowedRoles &&
        !allowedRoles.includes(userRole)
    ) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;