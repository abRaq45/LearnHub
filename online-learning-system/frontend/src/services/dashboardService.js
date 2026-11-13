
import api from "./api";

// Get complete learner dashboard
export const getLearnerDashboard = async () => {
    try {
        const response = await api.get("/dashboard/learner");
        return response.data;
    } catch (error) {
        console.error("Error fetching learner dashboard:", error);
        throw error;
    }
};

// Get enrolled courses with progress
export const getEnrolledCourses = async () => {
    try {
        const response = await api.get("/dashboard/learner/courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error;
    }
};

// Get dashboard statistics
export const getDashboardSummary = async () => {
    try {
        const response = await api.get("/dashboard/learner/summary");
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        throw error;
    }
};
