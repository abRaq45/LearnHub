
import api from "./api";

// Login user
const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

// Register new learner
const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

const authService = {
    loginUser,
    registerUser
};

export default authService;
