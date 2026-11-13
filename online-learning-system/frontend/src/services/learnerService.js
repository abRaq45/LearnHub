
import api from "./api";

// Get all learners
export const getAllLearners = async () => {
    const response = await api.get("/users/learners");
    return response.data;
};

// Get learner details
export const getLearnerById = async (learnerId) => {
    const response = await api.get(
        `/users/learners/${learnerId}`
    );
    return response.data;
};

// Get learner enrollments
export const getLearnerEnrollments = async (learnerId) => {
    const response = await api.get(
        `/users/learners/${learnerId}/enrollments`
    );
    return response.data;
};

// Activate or deactivate learner
export const updateLearnerStatus = async (learnerId, active) => {
    const response = await api.patch(
        `/users/learners/${learnerId}/status`,
        { active }
    );
    return response.data;
};
