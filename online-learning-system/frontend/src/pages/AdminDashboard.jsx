
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/Admin/AdminSidebar";
import { useAuth } from "../context/AuthContext";

import { getAllCourses } from "../services/courseService";
import { getAllLearners } from "../services/learnerService";
import { getAllEnrollments } from "../services/enrollmentService";
import { getLessonsByCourse } from "../services/lessonService";

import "./AdminDashboard.css";

function AdminDashboard() {
    const { user } = useAuth();

    const [courses, setCourses] = useState([]);
    const [learners, setLearners] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [totalLessons, setTotalLessons] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch main dashboard data
            const [
                courseResponse,
                learnerResponse,
                enrollmentResponse
            ] = await Promise.all([
                getAllCourses(),
                getAllLearners(),
                getAllEnrollments()
            ]);

            const courseData = Array.isArray(courseResponse)
                ? courseResponse
                : courseResponse?.content || [];

            const learnerData = Array.isArray(learnerResponse)
                ? learnerResponse
                : learnerResponse?.content || [];

            const enrollmentData = Array.isArray(enrollmentResponse)
                ? enrollmentResponse
                : enrollmentResponse?.content || [];

            setCourses(courseData);
            setLearners(learnerData);
            setEnrollments(enrollmentData);

            // Fetch lessons for every course
            const lessonResults = await Promise.allSettled(
                courseData.map(course => getLessonsByCourse(course.id))
            );

            let lessonCount = 0;
            let lessonFetchFailed = false;

            lessonResults.forEach(result => {
                if (result.status === "fulfilled") {
                    const data = result.value;

                    const lessons = Array.isArray(data)
                        ? data
                        : data?.content || [];

                    lessonCount += lessons.length;
                } else {
                    lessonFetchFailed = true;
                    console.error("Unable to fetch lessons:", result.reason);
                }
            });

            setTotalLessons(lessonCount);

            if (lessonFetchFailed) {
                console.warn(
                    "Some course lessons could not be loaded. The lesson count may be incomplete."
                );
            }

        } catch (err) {
            console.error("Admin Dashboard Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard information. Please refresh."
            );
        } finally {
            setLoading(false);
        }
    };

    // Enrollment statistics
    const activeEnrollments = enrollments.filter(
        item => item.status === "ACTIVE"
    );

    const cancelledEnrollments = enrollments.filter(
        item => item.status === "CANCELLED"
    );

    // Monthly enrollment growth for the current month and previous 5 months
    const monthlyEnrollmentData = useMemo(() => {
        const today = new Date();

        const months = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );

            months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                label: date.toLocaleDateString("en-IN", {
                    month: "short"
                }),
                count: 0
            });
        }

        enrollments.forEach(enrollment => {
            if (!enrollment.enrollmentDate) return;

            const date = new Date(enrollment.enrollmentDate);

            if (Number.isNaN(date.getTime())) return;

            const matchingMonth = months.find(
                item =>
                    item.year === date.getFullYear() &&
                    item.month === date.getMonth()
            );

            if (matchingMonth) {
                matchingMonth.count++;
            }
        });

        return months;
    }, [enrollments]);

    const maximumMonthlyEnrollments = Math.max(
        ...monthlyEnrollmentData.map(item => item.count),
        1
    );

    // Popular courses based on enrollment count
    const popularCourses = useMemo(() => {
        const courseCounts = courses.map(course => {
            const count = enrollments.filter(
                enrollment => enrollment.courseId === course.id
            ).length;

            return {
                ...course,
                enrollmentCount: count
            };
        });

        return courseCounts
            .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
            .slice(0, 5);
    }, [courses, enrollments]);

    // Enrollment distribution
    const totalEnrollmentCount = enrollments.length;

    const activePercentage = totalEnrollmentCount > 0
        ? Math.round(
            (activeEnrollments.length / totalEnrollmentCount) * 100
        )
        : 0;

    const cancelledPercentage = totalEnrollmentCount > 0
        ? Math.round(
            (cancelledEnrollments.length / totalEnrollmentCount) * 100
        )
        : 0;

    const formatDate = date => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "N/A";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const quickActions = [
        {
            title: "Manage Courses",
            description: "Create, update and manage courses.",
            icon: "＋",
            path: "/admin/courses",
            color: "blue"
        },
        {
            title: "Manage Lessons",
            description: "Organize course lessons and content.",
            icon: "▣",
            path: "/admin/lessons",
            color: "purple"
        },
        {
            title: "Manage Learners",
            description: "View and manage learner accounts.",
            icon: "♙",
            path: "/admin/learners",
            color: "green"
        },
        {
            title: "Manage Enrollments",
            description: "Monitor course registrations.",
            icon: "▤",
            path: "/admin/enrollments",
            color: "orange"
        }
    ];

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">

                {/* Dashboard Header */}
                <header className="admin-topbar">
                    <div>
                        <span className="dashboard-eyebrow">
                            LEARNHUB ADMINISTRATION
                        </span>

                        <h1>Dashboard Overview</h1>

                        <p>
                            Monitor your learning platform and its performance.
                        </p>
                    </div>

                    <div className="admin-profile">
                        <span className="admin-avatar">
                            {user?.email?.charAt(0).toUpperCase() || "A"}
                        </span>

                        <span>
                            {user?.email || "Administrator"}
                        </span>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="admin-error dashboard-error">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={fetchDashboardData}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="admin-stats-grid">

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon blue">
                            ▤
                        </div>

                        <div>
                            <p>Total Courses</p>
                            <h2>
                                {loading ? "..." : courses.length}
                            </h2>
                            <small>Available courses</small>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon green">
                            ♙
                        </div>

                        <div>
                            <p>Total Learners</p>
                            <h2>
                                {loading ? "..." : learners.length}
                            </h2>
                            <small>Registered learners</small>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon orange">
                            ▧
                        </div>

                        <div>
                            <p>Total Enrollments</p>
                            <h2>
                                {loading ? "..." : enrollments.length}
                            </h2>
                            <small>
                                {loading
                                    ? "Loading..."
                                    : `${activeEnrollments.length} active`}
                            </small>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon purple">
                            ▣
                        </div>

                        <div>
                            <p>Total Lessons</p>
                            <h2>
                                {loading ? "..." : totalLessons}
                            </h2>
                            <small>Across all courses</small>
                        </div>
                    </div>

                </section>

                {/* Quick Actions */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Manage different areas of LearnHub.</p>
                        </div>
                    </div>

                    <div className="admin-quick-actions">
                        {quickActions.map(action => (
                            <Link
                                to={action.path}
                                className="admin-action-card"
                                key={action.path}
                            >
                                <span className={`action-icon ${action.color}`}>
                                    {action.icon}
                                </span>

                                <div>
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>

                                <span className="action-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Analytics */}
                <section className="admin-analytics-grid">

                    {/* Monthly Enrollment Growth */}
                    <div className="admin-analytics-card">
                        <div className="analytics-card-heading">
                            <div>
                                <h2>Enrollment Growth</h2>
                                <p>Monthly enrollment activity</p>
                            </div>

                            <span className="analytics-heading-icon">
                                ↗
                            </span>
                        </div>

                        {loading ? (
                            <div className="analytics-empty">
                                Loading analytics...
                            </div>
                        ) : (
                            <div className="monthly-chart">
                                {monthlyEnrollmentData.map(item => (
                                    <div
                                        className="monthly-chart-column"
                                        key={`${item.year}-${item.month}`}
                                    >
                                        <span className="monthly-chart-value">
                                            {item.count}
                                        </span>

                                        <div className="monthly-chart-bar-area">
                                            <div
                                                className="monthly-chart-bar"
                                                style={{
                                                    height: `${Math.max(
                                                        (item.count / maximumMonthlyEnrollments) * 100,
                                                        item.count > 0 ? 5 : 0
                                                    )}%`
                                                }}
                                                title={`${item.count} enrollments`}
                                            />
                                        </div>

                                        <span className="monthly-chart-label">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="analytics-chart-footer">
                            <span>Last 6 months</span>
                            <strong>
                                {loading ? "..." : enrollments.length}
                                {" "}total enrollments
                            </strong>
                        </div>
                    </div>

                    {/* Enrollment Distribution */}
                    <div className="admin-analytics-card">
                        <div className="analytics-card-heading">
                            <div>
                                <h2>Enrollment Status</h2>
                                <p>Current enrollment distribution</p>
                            </div>

                            <span className="analytics-heading-icon">
                                ◉
                            </span>
                        </div>

                        {loading ? (
                            <div className="analytics-empty">
                                Loading analytics...
                            </div>
                        ) : (
                            <>
                                <div className="enrollment-distribution">
                                    <div
                                        className="distribution-circle"
                                        style={{
                                            background: `conic-gradient(
                                                #16a34a 0% ${activePercentage}%,
                                                #ef4444 ${activePercentage}% 100%
                                            )`
                                        }}
                                    >
                                        <div className="distribution-circle-inner">
                                            <strong>{totalEnrollmentCount}</strong>
                                            <span>Enrollments</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="distribution-legend">
                                    <div>
                                        <span className="legend-dot active-dot" />
                                        <span>Active</span>
                                        <strong>{activeEnrollments.length}</strong>
                                    </div>

                                    <div>
                                        <span className="legend-dot cancelled-dot" />
                                        <span>Cancelled</span>
                                        <strong>{cancelledEnrollments.length}</strong>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                </section>

                {/* Popular Courses */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Popular Courses</h2>
                            <p>Courses ranked by total enrollments.</p>
                        </div>

                        <Link
                            to="/admin/courses"
                            className="admin-view-all"
                        >
                            Manage Courses →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="admin-message">
                            Loading popular courses...
                        </div>
                    ) : popularCourses.length === 0 ? (
                        <div className="admin-empty">
                            <h3>No courses available</h3>
                            <p>Create courses to see course analytics.</p>
                        </div>
                    ) : (
                        <div className="popular-courses-list">
                            {popularCourses.map((course, index) => (
                                <div
                                    className="popular-course-item"
                                    key={course.id}
                                >
                                    <span className="popular-course-rank">
                                        #{index + 1}
                                    </span>

                                    <img
                                        src={
                                            course.thumbnailUrl ||
                                            "https://placehold.co/60x60?text=Course"
                                        }
                                        alt={course.title || "Course"}
                                        onError={event => {
                                            event.currentTarget.src =
                                                "https://placehold.co/60x60?text=Course";
                                        }}
                                    />

                                    <div className="popular-course-info">
                                        <strong>{course.title}</strong>
                                        <span>
                                            {course.category || "Uncategorized"}
                                        </span>
                                    </div>

                                    <div className="popular-course-count">
                                        <strong>{course.enrollmentCount}</strong>
                                        <span>Enrollments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Courses */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Recent Courses</h2>
                            <p>
                                Courses currently available on LearnHub.
                            </p>
                        </div>

                        <Link
                            to="/admin/courses"
                            className="admin-view-all"
                        >
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <p className="admin-message">
                            Loading courses...
                        </p>
                    ) : courses.length === 0 ? (
                        <div className="admin-empty">
                            <h3>No courses available</h3>
                            <p>
                                Create your first course to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Category</th>
                                        <th>Difficulty</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courses.slice(0, 5).map(course => (
                                        <tr key={course.id}>
                                            <td>
                                                <div className="admin-course-name">
                                                    <img
                                                        src={
                                                            course.thumbnailUrl ||
                                                            "https://placehold.co/60x60?text=Course"
                                                        }
                                                        alt={course.title || "Course"}
                                                        onError={event => {
                                                            event.currentTarget.src =
                                                                "https://placehold.co/60x60?text=Course";
                                                        }}
                                                    />

                                                    <strong>
                                                        {course.title}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                {course.category || "—"}
                                            </td>

                                            <td>
                                                {course.difficultyLevel || "—"}
                                            </td>

                                            <td>
                                                {formatDate(course.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Refresh Dashboard */}
                <div className="dashboard-refresh-footer">
                    <span>
                        Dashboard data is loaded from your LearnHub backend.
                    </span>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >
                        ↻ Refresh Dashboard
                    </button>
                </div>

            </main>
        </div>
    );
}

export default AdminDashboard;
