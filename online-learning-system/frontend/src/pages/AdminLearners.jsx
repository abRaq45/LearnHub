
import { useEffect, useMemo, useState } from "react";

import AdminSidebar from "../components/Admin/AdminSidebar";

import {
    getAllLearners,
    getLearnerEnrollments,
    updateLearnerStatus
} from "../services/learnerService";

import { getAllCourses } from "../services/courseService";

import "./AdminLearners.css";

function AdminLearners() {

    const [learners, setLearners] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedLearner, setSelectedLearner] = useState(null);
    const [learnerEnrollments, setLearnerEnrollments] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [updatingId, setUpdatingId] = useState(null);

    // Fetch learners and courses
    const fetchData = async () => {

        try {
            setLoading(true);
            setError("");

            const [learnerData, courseData] = await Promise.all([
                getAllLearners(),
                getAllCourses()
            ]);

            setLearners(Array.isArray(learnerData) ? learnerData : []);
            setCourses(Array.isArray(courseData) ? courseData : []);

        } catch (err) {
            console.error("Error fetching learner data:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load learner information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Statistics
    const totalLearners = learners.length;

    const activeLearners = learners.filter(
        learner => learner.active
    ).length;

    const inactiveLearners = learners.filter(
        learner => !learner.active
    ).length;

    const totalEnrollments = learners.reduce(
        (total, learner) => total + (learner.totalEnrollments || 0),
        0
    );

    // Search and filter
    const filteredLearners = useMemo(() => {

        return learners.filter(learner => {

            const search = searchTerm.toLowerCase();

            const matchesSearch =
                learner.name?.toLowerCase().includes(search) ||
                learner.email?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && learner.active) ||
                (statusFilter === "INACTIVE" && !learner.active);

            return matchesSearch && matchesStatus;
        });

    }, [learners, searchTerm, statusFilter]);

    // Find course name using courseId
    const getCourseName = (courseId) => {

        const course = courses.find(
            item => item.id === courseId
        );

        return course?.title || "Course unavailable";
    };

    // Format enrollment date
    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    // View learner details and enrollments
    const handleViewDetails = async (learner) => {

        try {
            setSelectedLearner(learner);
            setLearnerEnrollments([]);
            setDetailsLoading(true);
            setError("");

            const enrollmentData = await getLearnerEnrollments(
                learner.id
            );

            setLearnerEnrollments(
                Array.isArray(enrollmentData) ? enrollmentData : []
            );

        } catch (err) {
            console.error("Error fetching learner enrollments:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load learner enrollments."
            );

        } finally {
            setDetailsLoading(false);
        }
    };

    // Close details modal
    const handleCloseDetails = () => {
        setSelectedLearner(null);
        setLearnerEnrollments([]);
    };

    // Activate / deactivate learner
    const handleStatusChange = async (learner) => {

        const action = learner.active ? "deactivate" : "activate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${learner.name}'s account?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(learner.id);
            setError("");
            setSuccess("");

            const updatedLearner = await updateLearnerStatus(
                learner.id,
                !learner.active
            );

            setLearners(previous =>
                previous.map(item =>
                    item.id === learner.id
                        ? updatedLearner
                        : item
                )
            );

            if (
                selectedLearner &&
                selectedLearner.id === learner.id
            ) {
                setSelectedLearner(updatedLearner);
            }

            setSuccess(
                `${learner.name}'s account has been ${
                    updatedLearner.active ? "activated" : "deactivated"
                } successfully.`
            );

        } catch (err) {
            console.error("Error updating learner status:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update learner account status."
            );

        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-main learner-management">

                {/* Header */}
                <div className="learner-page-header">

                    <div>
                        <span className="learner-breadcrumb">
                            ADMIN / MANAGEMENT
                        </span>

                        <h1>Learner Management</h1>

                        <p>
                            Manage registered learners and monitor
                            their course enrollments.
                        </p>
                    </div>

                    <button
                        className="learner-refresh-btn"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                </div>

                {/* Notifications */}
                {error && (
                    <div className="learner-alert learner-alert-error">
                        {error}
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {success && (
                    <div className="learner-alert learner-alert-success">
                        {success}
                        <button onClick={() => setSuccess("")}>×</button>
                    </div>
                )}

                {/* Statistics */}
                <section className="learner-stats-grid">

                    <div className="learner-stat-card">
                        <div className="learner-stat-icon total-icon">
                            <span>♙</span>
                        </div>

                        <div>
                            <p>Total Learners</p>
                            <h2>{totalLearners}</h2>
                            <span>Registered accounts</span>
                        </div>
                    </div>

                    <div className="learner-stat-card">
                        <div className="learner-stat-icon active-icon">
                            <span>✓</span>
                        </div>

                        <div>
                            <p>Active Learners</p>
                            <h2>{activeLearners}</h2>
                            <span>Currently active</span>
                        </div>
                    </div>

                    <div className="learner-stat-card">
                        <div className="learner-stat-icon inactive-icon">
                            <span>⊘</span>
                        </div>

                        <div>
                            <p>Inactive Learners</p>
                            <h2>{inactiveLearners}</h2>
                            <span>Deactivated accounts</span>
                        </div>
                    </div>

                    <div className="learner-stat-card">
                        <div className="learner-stat-icon enrollment-icon">
                            <span>▤</span>
                        </div>

                        <div>
                            <p>Total Enrollments</p>
                            <h2>{totalEnrollments}</h2>
                            <span>Across all learners</span>
                        </div>
                    </div>

                </section>

                {/* Learner Table */}
                <section className="learner-table-section">

                    <div className="learner-table-header">

                        <div>
                            <h2>All Learners</h2>
                            <p>
                                View and manage registered learner accounts.
                            </p>
                        </div>

                        <span className="learner-count">
                            {filteredLearners.length} Learners
                        </span>

                    </div>

                    {/* Search and Filters */}
                    <div className="learner-toolbar">

                        <div className="learner-search">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={event =>
                                    setSearchTerm(event.target.value)
                                }
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={event =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                    </div>

                    {/* Table */}
                    {loading ? (

                        <div className="learner-loading">
                            <div className="learner-spinner"></div>
                            <p>Loading learners...</p>
                        </div>

                    ) : filteredLearners.length === 0 ? (

                        <div className="learner-empty">
                            <span>♙</span>
                            <h3>No learners found</h3>
                            <p>
                                Try changing your search or filter.
                            </p>
                        </div>

                    ) : (

                        <div className="learner-table-wrapper">

                            <table className="learner-table">

                                <thead>
                                    <tr>
                                        <th>Learner</th>
                                        <th>Email Address</th>
                                        <th>Enrollments</th>
                                        <th>Account Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredLearners.map(learner => (

                                        <tr key={learner.id}>

                                            <td>
                                                <div className="learner-name-cell">

                                                    <div className="learner-avatar">
                                                        {learner.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {learner.name}
                                                        </strong>
                                                        <small>
                                                            ID: {learner.id}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>{learner.email}</td>

                                            <td>
                                                <span className="enrollment-count">
                                                    {learner.totalEnrollments || 0}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`learner-status ${
                                                        learner.active
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }`}
                                                >
                                                    {learner.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="learner-actions">

                                                    <button
                                                        className="learner-view-btn"
                                                        onClick={() =>
                                                            handleViewDetails(learner)
                                                        }
                                                    >
                                                        View Details
                                                    </button>

                                                    <button
                                                        className={`learner-toggle-btn ${
                                                            learner.active
                                                                ? "deactivate-btn"
                                                                : "activate-btn"
                                                        }`}
                                                        onClick={() =>
                                                            handleStatusChange(learner)
                                                        }
                                                        disabled={
                                                            updatingId === learner.id
                                                        }
                                                    >
                                                        {updatingId === learner.id
                                                            ? "Updating..."
                                                            : learner.active
                                                                ? "Deactivate"
                                                                : "Activate"}
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

            {/* Learner Details Modal */}
            {selectedLearner && (

                <div
                    className="learner-modal-overlay"
                    onClick={handleCloseDetails}
                >

                    <div
                        className="learner-modal"
                        onClick={event => event.stopPropagation()}
                    >

                        <div className="learner-modal-header">

                            <div>
                                <span>LEARNER PROFILE</span>
                                <h2>Learner Details</h2>
                            </div>

                            <button
                                className="learner-modal-close"
                                onClick={handleCloseDetails}
                            >
                                ×
                            </button>

                        </div>

                        <div className="learner-profile">

                            <div className="learner-profile-avatar">
                                {selectedLearner.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>{selectedLearner.name}</h3>
                                <p>{selectedLearner.email}</p>

                                <span
                                    className={`learner-status ${
                                        selectedLearner.active
                                            ? "status-active"
                                            : "status-inactive"
                                    }`}
                                >
                                    {selectedLearner.active
                                        ? "Active Account"
                                        : "Inactive Account"}
                                </span>
                            </div>

                        </div>

                        <div className="learner-profile-info">

                            <div>
                                <span>Learner ID</span>
                                <strong>{selectedLearner.id}</strong>
                            </div>

                            <div>
                                <span>Role</span>
                                <strong>{selectedLearner.role}</strong>
                            </div>

                            <div>
                                <span>Total Enrollments</span>
                                <strong>
                                    {selectedLearner.totalEnrollments || 0}
                                </strong>
                            </div>

                        </div>

                        <div className="learner-enrollments-section">

                            <h3>Course Enrollments</h3>

                            {detailsLoading ? (

                                <div className="learner-modal-loading">
                                    Loading enrollments...
                                </div>

                            ) : learnerEnrollments.length === 0 ? (

                                <div className="learner-no-enrollments">
                                    This learner has not enrolled in any courses.
                                </div>

                            ) : (

                                <div className="learner-enrollment-list">

                                    {learnerEnrollments.map(enrollment => (

                                        <div
                                            className="learner-enrollment-item"
                                            key={enrollment.id}
                                        >

                                            <div className="enrollment-course-icon">
                                                ▤
                                            </div>

                                            <div className="enrollment-course-info">
                                                <strong>
                                                    {getCourseName(enrollment.courseId)}
                                                </strong>

                                                <small>
                                                    Enrolled: {formatDate(
                                                        enrollment.enrollmentDate
                                                    )}
                                                </small>
                                            </div>

                                            <span
                                                className={`enrollment-status ${
                                                    enrollment.status === "ACTIVE"
                                                        ? "enrollment-active"
                                                        : "enrollment-cancelled"
                                                }`}
                                            >
                                                {enrollment.status}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        <div className="learner-modal-footer">

                            <button
                                className="learner-modal-secondary"
                                onClick={handleCloseDetails}
                            >
                                Close
                            </button>

                            <button
                                className={`learner-modal-status-btn ${
                                    selectedLearner.active
                                        ? "deactivate-btn"
                                        : "activate-btn"
                                }`}
                                onClick={() =>
                                    handleStatusChange(selectedLearner)
                                }
                                disabled={
                                    updatingId === selectedLearner.id
                                }
                            >
                                {updatingId === selectedLearner.id
                                    ? "Updating..."
                                    : selectedLearner.active
                                        ? "Deactivate Account"
                                        : "Activate Account"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminLearners;
