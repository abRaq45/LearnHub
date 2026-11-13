
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password
            };

            const response = await authService.registerUser(userData);

            setSuccess(response.message || "Registration successful!");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
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

                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">LearnHub</h2>

                    <p className="text-muted">
                        Create your account and start learning.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                </form>

                <div className="text-center mt-4">
                    <p className="mb-0">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary fw-semibold"
                        >
                            Login
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Register;
