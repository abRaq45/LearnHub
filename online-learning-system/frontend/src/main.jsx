
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap JavaScript
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// Global CSS
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
