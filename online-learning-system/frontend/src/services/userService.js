
import api from "./api";

// Get the logged-in user's profile
export const getMyProfile = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

// Update the logged-in user's profile
export const updateMyProfile = async (profileData) => {
    const response = await api.put("/users/me", profileData);
    return response.data;
};

// Change the logged-in user's password
export const changeMyPassword = async (passwordData) => {
    const response = await api.patch(
        "/users/me/password",
        passwordData
    );
    return response.data;
};
