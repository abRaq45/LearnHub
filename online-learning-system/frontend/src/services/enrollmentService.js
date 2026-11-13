import api from "./api";

// Enroll the logged-in learner in a course
export const enrollInCourse = async (courseId) => {
    try {
        const response = await api.post(`/enrollments/${courseId}`);
        return response.data;
    } catch (error) {
        console.error("Error enrolling in course:", error);
        throw error;
    }
};

// Get all enrollments of the logged-in learner
export const getMyEnrollments = async () => {
    try {
        const response = await api.get("/enrollments/my-courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        throw error;
    }
};

// Get a particular enrollment by ID
export const getEnrollmentById = async (enrollmentId) => {
    try {
        const response = await api.get(`/enrollments/${enrollmentId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching enrollment:", error);
        throw error;
    }
};

// Cancel an enrollment
export const cancelEnrollment = async (enrollmentId) => {
    try {
        const response = await api.delete(`/enrollments/${enrollmentId}`);
        return response.data;
    } catch (error) {
        console.error("Error cancelling enrollment:", error);
        throw error;
    }
};

// ADMIN: Get all enrollments
export const getAllEnrollments = async () => {
    try {
        const response = await api.get("/enrollments/admin");
        return response.data;
    } catch (error) {
        console.error("Error fetching all enrollments:", error);
        throw error;
    }
};

// ADMIN: Update enrollment status
export const updateEnrollmentStatus = async (enrollmentId, status) => {
    try {
        const response = await api.patch(
            `/enrollments/admin/${enrollmentId}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating enrollment status:", error);
        throw error;
    }
};