import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");

        if (token && email && role) {
            return {
                email,
                role: role.toUpperCase().replace("ROLE_", "")
            };
        }

        return null;
    });

    const login = (authData) => {

        const normalizedRole = authData.role
            ?.toUpperCase()
            .replace("ROLE_", "");

        if (!authData.token || !authData.email || !normalizedRole) {
            console.error("Invalid login response:", authData);
            return;
        }

        localStorage.setItem("token", authData.token);
        localStorage.setItem("email", authData.email);
        localStorage.setItem("role", normalizedRole);

        setUser({
            email: authData.email,
            role: normalizedRole
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}