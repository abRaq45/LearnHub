
import api from "./api";

// Get all lessons for a course
export const getLessonsByCourse = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
};

// Get a single lesson
export const getLessonById = async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
};

// Create a lesson (Admin only)
export const createLesson = async (courseId, lessonData) => {
    const response = await api.post(
        `/courses/${courseId}/lessons`,
        lessonData
    );
    return response.data;
};

// Update a lesson (Admin only)
export const updateLesson = async (lessonId, lessonData) => {
    const response = await api.put(
        `/lessons/${lessonId}`,
        lessonData
    );
    return response.data;
};

// Delete a lesson (Admin only)
export const deleteLesson = async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
};

// Get progress for a course
export const getCourseProgress = async (courseId) => {
    const response = await api.get(`/progress/courses/${courseId}`);
    return response.data;
};

// Mark a lesson as completed
export const markLessonCompleted = async (courseId, lessonId) => {
    const response = await api.put(
        `/progress/courses/${courseId}/lessons/${lessonId}/complete`
    );
    return response.data;
};
