
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";

import {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse
} from "../services/courseService";

import "./AdminCourses.css";

const initialFormData = {
    title: "",
    description: "",
    category: "",
    difficultyLevel: "Beginner",
    instructorId: "",
    thumbnailUrl: ""
};

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [difficultyFilter, setDifficultyFilter] = useState("All");

    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});

    const [deletingId, setDeletingId] = useState(null);

    // Extract a readable API error
    const getErrorMessage = (err, fallback) => {
        return (
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            fallback
        );
    };

    // Fetch courses
    const fetchCourses = async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");

            const response = await getAllCourses();

            // Support both a direct array and common paginated responses.
            const courseList = Array.isArray(response)
                ? response
                : Array.isArray(response?.content)
                    ? response.content
                    : Array.isArray(response?.courses)
                        ? response.courses
                        : null;

            if (!courseList) {
                throw new Error("Unexpected course API response format.");
            }

            setCourses(courseList);
            return true;

        } catch (err) {
            console.error("Fetch courses error:", err);
            setError(getErrorMessage(err, "Unable to fetch courses."));
            return false;

        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Unique categories
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                courses
                    .map(course => course.category?.trim())
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));

        return ["All", ...uniqueCategories];
    }, [courses]);

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                course.title?.toLowerCase().includes(searchText) ||
                course.description?.toLowerCase().includes(searchText);

            const matchesCategory =
                categoryFilter === "All" ||
                course.category === categoryFilter;

            const matchesDifficulty =
                difficultyFilter === "All" ||
                course.difficultyLevel === difficultyFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesDifficulty
            );
        });
    }, [courses, search, categoryFilter, difficultyFilter]);

    // Open create form
    const handleAddCourse = () => {
        setEditingCourse(null);
        setFormData(initialFormData);
        setFormErrors({});
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Open edit form
    const handleEditCourse = (course) => {
        setEditingCourse(course);

        setFormData({
            title: course.title || "",
            description: course.description || "",
            category: course.category || "",
            difficultyLevel: course.difficultyLevel || "Beginner",
            instructorId: course.instructorId || "",
            thumbnailUrl: course.thumbnailUrl || ""
        });

        setFormErrors({});
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Handle input changes
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

    // Validate form
    const validateForm = () => {
        const errors = {};

        const title = formData.title.trim();
        const description = formData.description.trim();
        const category = formData.category.trim();
        const thumbnailUrl = formData.thumbnailUrl.trim();

        if (!title) {
            errors.title = "Course title is required.";
        } else if (title.length < 3) {
            errors.title = "Title must contain at least 3 characters.";
        } else if (title.length > 150) {
            errors.title = "Title cannot exceed 150 characters.";
        }

        if (!description) {
            errors.description = "Description is required.";
        } else if (description.length < 10) {
            errors.description = "Description must contain at least 10 characters.";
        }

        if (!category) {
            errors.category = "Category is required.";
        }

        if (
            !["Beginner", "Intermediate", "Advanced"].includes(
                formData.difficultyLevel
            )
        ) {
            errors.difficultyLevel = "Please select a valid difficulty level.";
        }

        if (thumbnailUrl) {
            try {
                const parsedUrl = new URL(thumbnailUrl);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    errors.thumbnailUrl = "Thumbnail must use HTTP or HTTPS.";
                }
            } catch {
                errors.thumbnailUrl = "Please enter a valid thumbnail URL.";
            }
        }

        return errors;
    };

    // Submit create or update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;

        setError("");
        setSuccess("");

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        setFormErrors({});

        const courseData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            difficultyLevel: formData.difficultyLevel,
            thumbnailUrl: formData.thumbnailUrl.trim()
        };

        if (!editingCourse && formData.instructorId.trim()) {
            courseData.instructorId = formData.instructorId.trim();
        }

        try {
            setSaving(true);

            if (editingCourse) {
                await updateCourse(editingCourse.id, courseData);
            } else {
                await createCourse(courseData);
            }

            setShowForm(false);
            setEditingCourse(null);
            setFormData(initialFormData);

            setSuccess(
                editingCourse
                    ? "Course updated successfully."
                    : "Course created successfully."
            );

            // Refresh separately so a refresh failure does not
            // incorrectly report that the save itself failed.
            const refreshed = await fetchCourses(false);

            if (!refreshed) {
                setError(
                    "The course was saved, but the course list could not be refreshed. Please reload the page."
                );
            }

        } catch (err) {
            console.error("Save course error:", err);

            setError(
                getErrorMessage(err, "Unable to save course. Please try again.")
            );

        } finally {
            setSaving(false);
        }
    };

    // Close modal
    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingCourse(null);
        setFormData(initialFormData);
        setFormErrors({});
    };

    // Delete course
    const handleDeleteCourse = async (courseId) => {
        if (deletingId || saving) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this course? Associated lessons, enrollments and progress should be considered before deletion."
        );

        if (!confirmed) return;

        try {
            setDeletingId(courseId);
            setError("");
            setSuccess("");

            await deleteCourse(courseId);

            setCourses(prev =>
                prev.filter(course => course.id !== courseId)
            );

            setSuccess("Course deleted successfully.");

        } catch (err) {
            console.error("Delete course error:", err);

            setError(
                getErrorMessage(err, "Unable to delete course.")
            );

        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-main">

                {/* Page Header */}
                <header className="courses-page-header">
                    <div>
                        <h1>Course Management</h1>
                        <p>
                            Create, manage and organize your courses.
                        </p>
                    </div>

                    <button
                        className="course-add-btn"
                        onClick={handleAddCourse}
                        disabled={loading}
                    >
                        + Add New Course
                    </button>
                </header>

                {/* Notifications */}
                {success && (
                    <div className="courses-success" role="status">
                        {success}
                        <button
                            type="button"
                            aria-label="Dismiss success message"
                            onClick={() => setSuccess("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="courses-error" role="alert">
                        {error}
                        <button
                            type="button"
                            aria-label="Dismiss error message"
                            onClick={() => setError("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="courses-summary">

                    <div className="courses-summary-card">
                        <span>Total Courses</span>
                        <h2>{courses.length}</h2>
                    </div>

                    <div className="courses-summary-card">
                        <span>Beginner Courses</span>
                        <h2>
                            {
                                courses.filter(
                                    c => c.difficultyLevel === "Beginner"
                                ).length
                            }
                        </h2>
                    </div>

                    <div className="courses-summary-card">
                        <span>Intermediate Courses</span>
                        <h2>
                            {
                                courses.filter(
                                    c => c.difficultyLevel === "Intermediate"
                                ).length
                            }
                        </h2>
                    </div>

                    <div className="courses-summary-card">
                        <span>Advanced Courses</span>
                        <h2>
                            {
                                courses.filter(
                                    c => c.difficultyLevel === "Advanced"
                                ).length
                            }
                        </h2>
                    </div>

                </section>

                {/* Search and Filters */}
                <section className="courses-toolbar">

                    <div className="courses-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search courses by title or description..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === "All"
                                    ? "All Categories"
                                    : category}
                            </option>
                        ))}
                    </select>

                    <select
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                    >
                        <option value="All">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                </section>

                {/* Course Table */}
                <section className="courses-content">

                    <div className="courses-content-header">
                        <div>
                            <h2>All Courses</h2>
                            <p>
                                {filteredCourses.length} courses found
                            </p>
                        </div>
                    </div>

                    {loading ? (

                        <div className="courses-loading">
                            Loading courses...
                        </div>

                    ) : filteredCourses.length === 0 ? (

                        <div className="courses-empty">
                            <h3>No courses found</h3>

                            <p>
                                Try changing your search or filters,
                                or add a new course.
                            </p>

                            <button
                                className="course-add-btn"
                                onClick={handleAddCourse}
                            >
                                + Add Course
                            </button>
                        </div>

                    ) : (

                        <div className="courses-table-wrapper">

                            <table className="courses-table">

                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Category</th>
                                        <th>Difficulty</th>
                                        <th>Created Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredCourses.map(course => (

                                        <tr key={course.id}>

                                            <td>
                                                <div className="courses-table-info">

                                                    <img
                                                        src={
                                                            course.thumbnailUrl ||
                                                            "https://placehold.co/70x55?text=Course"
                                                        }
                                                        alt={course.title}
                                                        onError={e => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src =
                                                                "https://placehold.co/70x55?text=Course";
                                                        }}
                                                    />

                                                    <div>
                                                        <strong>
                                                            {course.title}
                                                        </strong>

                                                        <small>
                                                            ID: {course.id}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                {course.category || "—"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`difficulty-badge ${
                                                        course.difficultyLevel
                                                            ?.toLowerCase()
                                                    }`}
                                                >
                                                    {course.difficultyLevel || "—"}
                                                </span>
                                            </td>

                                            <td>
                                                {course.createdAt
                                                    ? new Date(
                                                        course.createdAt
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td>
                                                <div className="course-actions">

                                                    <button
                                                        type="button"
                                                        className="course-edit-btn"
                                                        onClick={() =>
                                                            handleEditCourse(course)
                                                        }
                                                        disabled={Boolean(deletingId)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="course-delete-btn"
                                                        onClick={() =>
                                                            handleDeleteCourse(course.id)
                                                        }
                                                        disabled={
                                                            deletingId === course.id ||
                                                            Boolean(deletingId)
                                                        }
                                                    >
                                                        {deletingId === course.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

            {/* Add / Edit Course Modal */}
            {showForm && (

                <div
                    className="course-modal-overlay"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) {
                            closeForm();
                        }
                    }}
                >

                    <div className="course-modal">

                        <div className="course-modal-header">

                            <div>
                                <h2>
                                    {editingCourse
                                        ? "Edit Course"
                                        : "Create New Course"}
                                </h2>

                                <p>
                                    Enter the course information below.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="course-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="course-form-group">
                                <label htmlFor="course-title">
                                    Course Title *
                                </label>

                                <input
                                    id="course-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter course title"
                                    required
                                    maxLength={150}
                                    disabled={saving}
                                />

                                {formErrors.title && (
                                    <small className="courses-error-text">
                                        {formErrors.title}
                                    </small>
                                )}
                            </div>

                            <div className="course-form-group">
                                <label htmlFor="course-description">
                                    Description *
                                </label>

                                <textarea
                                    id="course-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what learners will learn..."
                                    rows="4"
                                    required
                                    disabled={saving}
                                />

                                {formErrors.description && (
                                    <small className="courses-error-text">
                                        {formErrors.description}
                                    </small>
                                )}
                            </div>

                            <div className="course-form-row">

                                <div className="course-form-group">
                                    <label htmlFor="course-category">
                                        Category *
                                    </label>

                                    <input
                                        id="course-category"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g. Programming"
                                        required
                                        disabled={saving}
                                    />

                                    {formErrors.category && (
                                        <small className="courses-error-text">
                                            {formErrors.category}
                                        </small>
                                    )}
                                </div>

                                <div className="course-form-group">
                                    <label htmlFor="course-difficulty">
                                        Difficulty Level *
                                    </label>

                                    <select
                                        id="course-difficulty"
                                        name="difficultyLevel"
                                        value={formData.difficultyLevel}
                                        onChange={handleChange}
                                        required
                                        disabled={saving}
                                    >
                                        <option value="Beginner">
                                            Beginner
                                        </option>

                                        <option value="Intermediate">
                                            Intermediate
                                        </option>

                                        <option value="Advanced">
                                            Advanced
                                        </option>
                                    </select>

                                    {formErrors.difficultyLevel && (
                                        <small className="courses-error-text">
                                            {formErrors.difficultyLevel}
                                        </small>
                                    )}
                                </div>

                            </div>

                            {!editingCourse && (
                                <div className="course-form-group">
                                    <label htmlFor="course-instructor">
                                        Instructor ID (Optional)
                                    </label>

                                    <input
                                        id="course-instructor"
                                        type="text"
                                        name="instructorId"
                                        value={formData.instructorId}
                                        onChange={handleChange}
                                        placeholder="Enter instructor ID if applicable"
                                        disabled={saving}
                                    />
                                </div>
                            )}

                            <div className="course-form-group">
                                <label htmlFor="course-thumbnail">
                                    Thumbnail URL (Optional)
                                </label>

                                <input
                                    id="course-thumbnail"
                                    type="url"
                                    name="thumbnailUrl"
                                    value={formData.thumbnailUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={saving}
                                />

                                {formErrors.thumbnailUrl && (
                                    <small className="courses-error-text">
                                        {formErrors.thumbnailUrl}
                                    </small>
                                )}
                            </div>

                            {formData.thumbnailUrl && (
                                <div className="course-image-preview">
                                    <label>Thumbnail Preview</label>

                                    <img
                                        src={formData.thumbnailUrl}
                                        alt="Course thumbnail preview"
                                        onError={e => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                        onLoad={e => {
                                            e.currentTarget.style.display = "block";
                                        }}
                                    />
                                </div>
                            )}

                            <div className="course-form-actions">

                                <button
                                    type="button"
                                    className="course-cancel-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="course-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCourse
                                            ? "Update Course"
                                            : "Create Course"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminCourses;
