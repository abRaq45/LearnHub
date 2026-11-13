
import { useEffect, useMemo, useState } from "react";

import AdminSidebar from "../components/Admin/AdminSidebar";
import { getAllEnrollments, updateEnrollmentStatus } from "../services/enrollmentService";
import { getAllLearners } from "../services/learnerService";
import { getAllCourses } from "../services/courseService";

import "./AdminEnrollments.css";

function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [learners, setLearners] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [enrollmentData, learnerData, courseData] =
                await Promise.all([
                    getAllEnrollments(),
                    getAllLearners(),
                    getAllCourses()
                ]);

            setEnrollments(
                Array.isArray(enrollmentData) ? enrollmentData : []
            );

            setLearners(
                Array.isArray(learnerData) ? learnerData : []
            );

            setCourses(
                Array.isArray(courseData) ? courseData : []
            );

        } catch (err) {
            console.error("Error fetching enrollments:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load enrollment information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const activeCount = enrollments.filter(
        item => item.status === "ACTIVE"
    ).length;

    const cancelledCount = enrollments.filter(
        item => item.status === "CANCELLED"
    ).length;

    const findLearner = (userId) => {
        return learners.find(item => item.id === userId);
    };

    const findCourse = (courseId) => {
        return courses.find(item => item.id === courseId);
    };

    const filteredEnrollments = useMemo(() => {
        return enrollments.filter(enrollment => {
            const learner = learners.find(
                item => item.id === enrollment.userId
            );

            const course = courses.find(
                item => item.id === enrollment.courseId
            );

            const search = searchTerm.toLowerCase();

            const matchesSearch =
                learner?.name?.toLowerCase().includes(search) ||
                learner?.email?.toLowerCase().includes(search) ||
                course?.title?.toLowerCase().includes(search) ||
                enrollment.id?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                enrollment.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [enrollments, learners, courses, searchTerm, statusFilter]);

    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const handleStatusChange = async (enrollment) => {
        const nextStatus =
            enrollment.status === "ACTIVE"
                ? "CANCELLED"
                : "ACTIVE";

        const confirmed = window.confirm(
            `Are you sure you want to change this enrollment to ${nextStatus}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(enrollment.id);
            setError("");
            setSuccess("");

            const updated = await updateEnrollmentStatus(
                enrollment.id,
                nextStatus
            );

            setEnrollments(previous =>
                previous.map(item =>
                    item.id === enrollment.id ? updated : item
                )
            );

            setSelectedEnrollment(previous =>
                previous?.id === enrollment.id ? updated : previous
            );

            setSuccess(
                `Enrollment status changed to ${updated.status}.`
            );

        } catch (err) {
            console.error("Error updating enrollment:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update enrollment status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main admin-enrollments">

                <header className="enrollment-page-header">
                    <div>
                        <span className="enrollment-breadcrumb">
                            ADMIN / MANAGEMENT
                        </span>

                        <h1>Enrollment Management</h1>

                        <p>
                            Monitor learner registrations and manage
                            course enrollment status.
                        </p>
                    </div>

                    <button
                        className="enrollment-refresh-btn"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </header>

                {error && (
                    <div className="enrollment-alert error">
                        {error}
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {success && (
                    <div className="enrollment-alert success">
                        {success}
                        <button onClick={() => setSuccess("")}>×</button>
                    </div>
                )}

                <section className="enrollment-stats">

                    <div className="enrollment-stat-card">
                        <span className="stat-symbol all">▤</span>
                        <div>
                            <p>Total Enrollments</p>
                            <h2>{enrollments.length}</h2>
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <span className="stat-symbol active">✓</span>
                        <div>
                            <p>Active Enrollments</p>
                            <h2>{activeCount}</h2>
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <span className="stat-symbol cancelled">⊘</span>
                        <div>
                            <p>Cancelled Enrollments</p>
                            <h2>{cancelledCount}</h2>
                        </div>
                    </div>

                </section>

                <section className="enrollment-table-section">

                    <div className="enrollment-table-heading">
                        <div>
                            <h2>All Enrollments</h2>
                            <p>Review and manage course registrations.</p>
                        </div>

                        <span>
                            {filteredEnrollments.length} Records
                        </span>
                    </div>

                    <div className="enrollment-toolbar">

                        <input
                            type="text"
                            placeholder="Search learner, email, course or ID..."
                            value={searchTerm}
                            onChange={event =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        <select
                            value={statusFilter}
                            onChange={event =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                    </div>

                    {loading ? (
                        <div className="enrollment-empty">
                            Loading enrollments...
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="enrollment-empty">
                            <h3>No enrollments found</h3>
                            <p>Try changing your search or filter.</p>
                        </div>
                    ) : (
                        <div className="enrollment-table-wrapper">
                            <table className="enrollment-table">
                                <thead>
                                    <tr>
                                        <th>Learner</th>
                                        <th>Course</th>
                                        <th>Enrollment Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEnrollments.map(enrollment => {
                                        const learner = findLearner(
                                            enrollment.userId
                                        );

                                        const course = findCourse(
                                            enrollment.courseId
                                        );

                                        return (
                                            <tr key={enrollment.id}>
                                                <td>
                                                    <div className="enrollment-person">
                                                        <div className="enrollment-avatar">
                                                            {learner?.name
                                                                ?.charAt(0)
                                                                .toUpperCase() || "?"}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {learner?.name || "Learner unavailable"}
                                                            </strong>
                                                            <small>
                                                                {learner?.email || enrollment.userId}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong className="enrollment-course-name">
                                                        {course?.title || "Course unavailable"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatDate(enrollment.enrollmentDate)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`enrollment-status-badge ${
                                                            enrollment.status === "ACTIVE"
                                                                ? "active"
                                                                : "cancelled"
                                                        }`}
                                                    >
                                                        {enrollment.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="enrollment-actions">
                                                        <button
                                                            className="enrollment-view-btn"
                                                            onClick={() =>
                                                                setSelectedEnrollment(enrollment)
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className={
                                                                enrollment.status === "ACTIVE"
                                                                    ? "enrollment-cancel-btn"
                                                                    : "enrollment-activate-btn"
                                                            }
                                                            disabled={
                                                                updatingId === enrollment.id
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(enrollment)
                                                            }
                                                        >
                                                            {updatingId === enrollment.id
                                                                ? "Updating..."
                                                                : enrollment.status === "ACTIVE"
                                                                    ? "Cancel"
                                                                    : "Reactivate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {selectedEnrollment && (
                <div
                    className="enrollment-modal-overlay"
                    onClick={() => setSelectedEnrollment(null)}
                >
                    <div
                        className="enrollment-modal"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="enrollment-modal-header">
                            <div>
                                <span>ENROLLMENT DETAILS</span>
                                <h2>Registration Information</h2>
                            </div>

                            <button
                                onClick={() => setSelectedEnrollment(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="enrollment-modal-body">
                            <div>
                                <span>Enrollment ID</span>
                                <strong>{selectedEnrollment.id}</strong>
                            </div>

                            <div>
                                <span>Learner</span>
                                <strong>
                                    {findLearner(selectedEnrollment.userId)?.name ||
                                        "Learner unavailable"}
                                </strong>
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>
                                    {findLearner(selectedEnrollment.userId)?.email ||
                                        "Not available"}
                                </strong>
                            </div>

                            <div>
                                <span>Course</span>
                                <strong>
                                    {findCourse(selectedEnrollment.courseId)?.title ||
                                        "Course unavailable"}
                                </strong>
                            </div>

                            <div>
                                <span>Enrollment Date</span>
                                <strong>
                                    {formatDate(selectedEnrollment.enrollmentDate)}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>{selectedEnrollment.status}</strong>
                            </div>
                        </div>

                        <div className="enrollment-modal-footer">
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedEnrollment(null)}
                            >
                                Close
                            </button>

                            <button
                                className={
                                    selectedEnrollment.status === "ACTIVE"
                                        ? "enrollment-cancel-btn"
                                        : "enrollment-activate-btn"
                                }
                                disabled={
                                    updatingId === selectedEnrollment.id
                                }
                                onClick={() =>
                                    handleStatusChange(selectedEnrollment)
                                }
                            >
                                {updatingId === selectedEnrollment.id
                                    ? "Updating..."
                                    : selectedEnrollment.status === "ACTIVE"
                                        ? "Cancel Enrollment"
                                        : "Reactivate Enrollment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEnrollments;
