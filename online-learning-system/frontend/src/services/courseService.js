
import api from "./api";

// Fetch all courses
export const getAllCourses = async () => {
    try {
        const response = await api.get("/courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};

// Fetch a course by its ID
export const getCourseById = async (courseId) => {
    try {
        const response = await api.get(`/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course with ID ${courseId}:`, error);
        throw error;
    }
};

// Create a new course (Admin only)
export const createCourse = async (courseData) => {
    try {
        const response = await api.post("/courses", courseData);
        return response.data;
    } catch (error) {
        console.error("Error creating course:", error);
        throw error;
    }
};

// Update an existing course (Admin only)
export const updateCourse = async (courseId, courseData) => {
    try {
        const response = await api.put(`/courses/${courseId}`, courseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating course with ID ${courseId}:`, error);
        throw error;
    }
};

// Delete a course (Admin only)
export const deleteCourse = async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting course with ID ${courseId}:`, error);
        throw error;
    }
};
