
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";

import { getAllCourses } from "../services/courseService";

import {
    getLessonsByCourse,
    createLesson,
    updateLesson,
    deleteLesson
} from "../services/lessonService";

import "./AdminLessons.css";

const initialFormData = {
    title: "",
    content: "",
    videoUrl: "",
    lessonOrder: 1
};

function AdminLessons() {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const [lessons, setLessons] = useState([]);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});

    const [deletingId, setDeletingId] = useState(null);

    // Extract API error messages
    const getErrorMessage = (err, fallback) => {
        return (
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            fallback
        );
    };

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            setError("");

            const response = await getAllCourses();

            const courseList = Array.isArray(response)
                ? response
                : Array.isArray(response?.content)
                    ? response.content
                    : Array.isArray(response?.courses)
                        ? response.courses
                        : null;

            if (!courseList) {
                throw new Error("Unexpected course API response.");
            }

            setCourses(courseList);

            if (courseList.length > 0) {
                setSelectedCourseId(courseList[0].id);
            }

        } catch (err) {
            console.error("Fetch courses error:", err);
            setError(
                getErrorMessage(err, "Unable to load courses.")
            );
        } finally {
            setLoadingCourses(false);
        }
    };

    // Fetch lessons for selected course
    const fetchLessons = async (courseId) => {
        if (!courseId) {
            setLessons([]);
            return;
        }

        try {
            setLoadingLessons(true);
            setError("");

            const response = await getLessonsByCourse(courseId);

            const lessonList = Array.isArray(response)
                ? response
                : Array.isArray(response?.content)
                    ? response.content
                    : Array.isArray(response?.lessons)
                        ? response.lessons
                        : null;

            if (!lessonList) {
                throw new Error("Unexpected lesson API response.");
            }

            setLessons(
                [...lessonList].sort(
                    (a, b) => a.lessonOrder - b.lessonOrder
                )
            );

        } catch (err) {
            console.error("Fetch lessons error:", err);
            setLessons([]);
            setError(
                getErrorMessage(err, "Unable to load lessons.")
            );
        } finally {
            setLoadingLessons(false);
        }
    };

    // Initial course loading
    useEffect(() => {
        fetchCourses();
    }, []);

    // Load lessons whenever course selection changes
    useEffect(() => {
        if (selectedCourseId) {
            fetchLessons(selectedCourseId);
        } else {
            setLessons([]);
        }
    }, [selectedCourseId]);

    // Selected course details
    const selectedCourse = useMemo(() => {
        return courses.find(
            course => course.id === selectedCourseId
        );
    }, [courses, selectedCourseId]);

    // Filter lessons
    const filteredLessons = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return lessons.filter(lesson =>
            lesson.title?.toLowerCase().includes(searchText)
        );
    }, [lessons, search]);

    // Next lesson order
    const nextLessonOrder = useMemo(() => {
        if (lessons.length === 0) {
            return 1;
        }

        return Math.max(
            ...lessons.map(lesson => Number(lesson.lessonOrder) || 0)
        ) + 1;
    }, [lessons]);

    // Open add lesson form
    const handleAddLesson = () => {
        setEditingLesson(null);

        setFormData({
            ...initialFormData,
            lessonOrder: nextLessonOrder
        });

        setFormErrors({});
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Open edit lesson form
    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);

        setFormData({
            title: lesson.title || "",
            content: lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            lessonOrder: lesson.lessonOrder || 1
        });

        setFormErrors({});
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setFormErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    // Validate lesson form
    const validateForm = () => {
        const errors = {};

        const title = formData.title.trim();
        const content = formData.content.trim();
        const videoUrl = formData.videoUrl.trim();
        const lessonOrder = Number(formData.lessonOrder);

        if (!title) {
            errors.title = "Lesson title is required.";
        } else if (title.length < 3) {
            errors.title = "Title must contain at least 3 characters.";
        }

        if (!content) {
            errors.content = "Lesson content is required.";
        }

        if (
            !Number.isInteger(lessonOrder) ||
            lessonOrder < 1
        ) {
            errors.lessonOrder = "Lesson order must be a positive whole number.";
        } else {
            const duplicateOrder = lessons.some(lesson =>
                Number(lesson.lessonOrder) === lessonOrder &&
                lesson.id !== editingLesson?.id
            );

            if (duplicateOrder) {
                errors.lessonOrder =
                    "This lesson order is already being used in this course.";
            }
        }

        if (videoUrl) {
            try {
                const parsedUrl = new URL(videoUrl);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    errors.videoUrl = "Video URL must use HTTP or HTTPS.";
                }
            } catch {
                errors.videoUrl = "Please enter a valid video URL.";
            }
        }

        return errors;
    };

    // Submit create or update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving || !selectedCourseId) return;

        setError("");
        setSuccess("");

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        setFormErrors({});

        const lessonData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            videoUrl: formData.videoUrl.trim(),
            lessonOrder: Number(formData.lessonOrder)
        };

        try {
            setSaving(true);

            if (editingLesson) {
                await updateLesson(
                    editingLesson.id,
                    lessonData
                );

                setSuccess("Lesson updated successfully.");

            } else {
                await createLesson(
                    selectedCourseId,
                    lessonData
                );

                setSuccess("Lesson created successfully.");
            }

            setShowForm(false);
            setEditingLesson(null);
            setFormData(initialFormData);

            await fetchLessons(selectedCourseId);

        } catch (err) {
            console.error("Save lesson error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to save lesson. Please try again."
                )
            );

        } finally {
            setSaving(false);
        }
    };

    // Close modal
    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingLesson(null);
        setFormData(initialFormData);
        setFormErrors({});
    };

    // Delete lesson
    const handleDeleteLesson = async (lesson) => {
        if (deletingId || saving) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeletingId(lesson.id);
            setError("");
            setSuccess("");

            await deleteLesson(lesson.id);

            setLessons(prev =>
                prev.filter(item => item.id !== lesson.id)
            );

            setSuccess("Lesson deleted successfully.");

        } catch (err) {
            console.error("Delete lesson error:", err);

            setError(
                getErrorMessage(err, "Unable to delete lesson.")
            );

        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-main">

                {/* Header */}
                <header className="lessons-page-header">

                    <div>
                        <h1>Lesson Management</h1>
                        <p>
                            Create, organize and manage course lessons.
                        </p>
                    </div>

                    <button
                        className="lesson-add-btn"
                        onClick={handleAddLesson}
                        disabled={!selectedCourseId || loadingCourses}
                    >
                        + Add New Lesson
                    </button>

                </header>

                {/* Notifications */}
                {success && (
                    <div className="lessons-success" role="status">
                        {success}

                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="lessons-error" role="alert">
                        {error}

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Course Selection */}
                <section className="lesson-course-selector">

                    <div>
                        <label htmlFor="lesson-course-select">
                            Select Course
                        </label>

                        <select
                            id="lesson-course-select"
                            value={selectedCourseId}
                            onChange={e => {
                                setSelectedCourseId(e.target.value);
                                setSearch("");
                                setSuccess("");
                                setError("");
                            }}
                            disabled={loadingCourses}
                        >
                            <option value="">
                                Select a course
                            </option>

                            {courses.map(course => (
                                <option
                                    key={course.id}
                                    value={course.id}
                                >
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <div className="lesson-selected-course">
                            <span>Selected Course</span>
                            <strong>{selectedCourse.title}</strong>
                            <small>
                                {selectedCourse.category || "Uncategorized"}
                                {" · "}
                                {selectedCourse.difficultyLevel || "—"}
                            </small>
                        </div>
                    )}

                </section>

                {/* Lesson Statistics */}
                <section className="lessons-summary">

                    <div className="lessons-summary-card">
                        <span>Total Lessons</span>
                        <h2>{lessons.length}</h2>
                    </div>

                    <div className="lessons-summary-card">
                        <span>Course</span>
                        <h2 className="lesson-course-stat">
                            {selectedCourse ? "Selected" : "—"}
                        </h2>
                    </div>

                    <div className="lessons-summary-card">
                        <span>Last Lesson Order</span>
                        <h2>
                            {lessons.length > 0
                                ? Math.max(
                                    ...lessons.map(
                                        lesson => Number(lesson.lessonOrder) || 0
                                    )
                                )
                                : 0}
                        </h2>
                    </div>

                </section>

                {/* Search */}
                <section className="lessons-toolbar">

                    <div className="lessons-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search lessons by title..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            disabled={!selectedCourseId}
                        />
                    </div>

                </section>

                {/* Lessons List */}
                <section className="lessons-content">

                    <div className="lessons-content-header">
                        <div>
                            <h2>Course Lessons</h2>
                            <p>
                                {filteredLessons.length} lessons found
                            </p>
                        </div>
                    </div>

                    {loadingCourses ? (

                        <div className="lessons-loading">
                            Loading courses...
                        </div>

                    ) : courses.length === 0 ? (

                        <div className="lessons-empty">
                            <h3>No courses available</h3>
                            <p>
                                Create a course before adding lessons.
                            </p>
                        </div>

                    ) : loadingLessons ? (

                        <div className="lessons-loading">
                            Loading lessons...
                        </div>

                    ) : filteredLessons.length === 0 ? (

                        <div className="lessons-empty">
                            <h3>No lessons found</h3>

                            <p>
                                Add a new lesson or change your search.
                            </p>

                            <button
                                className="lesson-add-btn"
                                onClick={handleAddLesson}
                            >
                                + Add Lesson
                            </button>
                        </div>

                    ) : (

                        <div className="lessons-list">

                            {filteredLessons.map((lesson, index) => (

                                <div
                                    className="lesson-admin-card"
                                    key={lesson.id}
                                >

                                    <div className="lesson-order-number">
                                        {lesson.lessonOrder}
                                    </div>

                                    <div className="lesson-admin-info">

                                        <h3>{lesson.title}</h3>

                                        <p>
                                            {lesson.content?.length > 130
                                                ? `${lesson.content.substring(0, 130)}...`
                                                : lesson.content}
                                        </p>

                                        <div className="lesson-admin-meta">
                                            <span>
                                                Lesson {lesson.lessonOrder}
                                            </span>

                                            {lesson.videoUrl && (
                                                <span>
                                                    Video attached
                                                </span>
                                            )}
                                        </div>

                                    </div>

                                    <div className="lesson-admin-actions">

                                        <button
                                            type="button"
                                            className="lesson-edit-btn"
                                            onClick={() =>
                                                handleEditLesson(lesson)
                                            }
                                            disabled={Boolean(deletingId)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="lesson-delete-btn"
                                            onClick={() =>
                                                handleDeleteLesson(lesson)
                                            }
                                            disabled={Boolean(deletingId)}
                                        >
                                            {deletingId === lesson.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

            {/* Add / Edit Lesson Modal */}
            {showForm && (

                <div
                    className="lesson-modal-overlay"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) {
                            closeForm();
                        }
                    }}
                >

                    <div className="lesson-modal">

                        <div className="lesson-modal-header">

                            <div>
                                <h2>
                                    {editingLesson
                                        ? "Edit Lesson"
                                        : "Create New Lesson"}
                                </h2>

                                <p>
                                    {selectedCourse?.title}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="lesson-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="lesson-form-group">

                                <label htmlFor="lesson-title">
                                    Lesson Title *
                                </label>

                                <input
                                    id="lesson-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter lesson title"
                                    disabled={saving}
                                />

                                {formErrors.title && (
                                    <small className="lesson-field-error">
                                        {formErrors.title}
                                    </small>
                                )}

                            </div>

                            <div className="lesson-form-group">

                                <label htmlFor="lesson-content">
                                    Lesson Content *
                                </label>

                                <textarea
                                    id="lesson-content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Enter lesson content..."
                                    rows="6"
                                    disabled={saving}
                                />

                                {formErrors.content && (
                                    <small className="lesson-field-error">
                                        {formErrors.content}
                                    </small>
                                )}

                            </div>

                            <div className="lesson-form-row">

                                <div className="lesson-form-group">

                                    <label htmlFor="lesson-order">
                                        Lesson Order *
                                    </label>

                                    <input
                                        id="lesson-order"
                                        type="number"
                                        name="lessonOrder"
                                        min="1"
                                        step="1"
                                        value={formData.lessonOrder}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />

                                    {formErrors.lessonOrder && (
                                        <small className="lesson-field-error">
                                            {formErrors.lessonOrder}
                                        </small>
                                    )}

                                </div>

                                <div className="lesson-form-group">

                                    <label htmlFor="lesson-video">
                                        Video URL (Optional)
                                    </label>

                                    <input
                                        id="lesson-video"
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/video"
                                        disabled={saving}
                                    />

                                    {formErrors.videoUrl && (
                                        <small className="lesson-field-error">
                                            {formErrors.videoUrl}
                                        </small>
                                    )}

                                </div>

                            </div>

                            <div className="lesson-form-actions">

                                <button
                                    type="button"
                                    className="lesson-cancel-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="lesson-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingLesson
                                            ? "Update Lesson"
                                            : "Create Lesson"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminLessons;
