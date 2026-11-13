import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle login
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Call login API
            const response = await authService.loginUser(formData);

            console.log("Login API Response:", response);

            // Normalize role
            const role = response.role
                ?.toUpperCase()
                .replace("ROLE_", "");

            if (!response.token || !response.email || !role) {
                throw new Error("Invalid login response from server.");
            }

            // Store authentication information
            login({
                ...response,
                role
            });

            // Redirect according to user role
            if (role === "ADMIN") {
                navigate("/admin/dashboard", { replace: true });
            } else if (role === "LEARNER") {
                navigate("/dashboard", { replace: true });
            } else {
                setError("Your account has an invalid role.");
            }

        } catch (err) {
            console.error("Login Error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">

            <div
                className="card shadow-lg border-0 p-4"
                style={{ width: "100%", maxWidth: "450px" }}
            >

                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">
                        LearnHub
                    </h2>

                    <p className="text-muted">
                        Welcome back! Login to continue learning.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Register Link */}
                <div className="text-center mt-4">
                    <p className="mb-0">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-primary fw-semibold"
                        >
                            Register
                        </Link>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Login;