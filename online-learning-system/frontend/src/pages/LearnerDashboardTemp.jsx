
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getLearnerDashboard } from "../services/dashboardService";

import "./LearnerDashboard.css";

function LearnerDashboardTemp() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getLearnerDashboard();
            setDashboard(response);

        } catch (err) {
            console.error("Learner Dashboard Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const courses = Array.isArray(dashboard?.courses)
        ? dashboard.courses
        : [];

    const completedCourses = courses.filter(
        course => Number(course.completionPercentage) >= 100
    );

    const inProgressCourses = courses.filter(
        course => Number(course.completionPercentage) < 100
    );

    const continueCourse = inProgressCourses[0] || null;

    const overallProgress = useMemo(() => {
        if (courses.length === 0) return 0;

        const totalLessons = courses.reduce(
            (total, course) =>
                total +
                (Number(course.completedLessons) || 0) +
                (Number(course.pendingLessons) || 0),
            0
        );

        const completedLessons = courses.reduce(
            (total, course) =>
                total + (Number(course.completedLessons) || 0),
            0
        );

        return totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
    }, [courses]);

    const formatPercentage = value => {
        return Math.min(100, Math.max(0, Number(value) || 0));
    };

    const handleImageError = event => {
        event.currentTarget.src =
            "https://placehold.co/600x350?text=Course";
    };

    const renderCourseCard = course => {
        const percentage = formatPercentage(
            course.completionPercentage
        );

        const completed = percentage >= 100;

        return (
            <article
                className="enrolled-course-card"
                key={course.courseId}
            >
                <div className="enrolled-course-image">
                    <img
                        src={
                            course.thumbnailUrl ||
                            "https://placehold.co/600x350?text=Course"
                        }
                        alt={course.title || "Course"}
                        onError={handleImageError}
                    />

                    <span
                        className={`course-image-status ${
                            completed ? "completed" : "in-progress"
                        }`}
                    >
                        {completed ? "Completed" : "In Progress"}
                    </span>
                </div>

                <div className="enrolled-course-content">
                    <span className="course-category">
                        {course.category || "General"}
                    </span>

                    <h3>{course.title || "Untitled Course"}</h3>

                    <p className="course-difficulty">
                        Level: {course.difficultyLevel || "Not specified"}
                    </p>

                    <span className="enrollment-status">
                        {course.status || "ACTIVE"}
                    </span>

                    <div className="course-progress-info">
                        <span>Course Progress</span>
                        <strong>{percentage.toFixed(1)}%</strong>
                    </div>

                    <div
                        className="course-progress-bar"
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${course.title} completion progress`}
                    >
                        <div
                            className={`course-progress-fill ${
                                completed ? "completed-progress" : ""
                            }`}
                            style={{
                                width: `${percentage}%`
                            }}
                        />
                    </div>

                    <div className="lesson-statistics">
                        <span>
                            ✓ {Number(course.completedLessons) || 0} Completed
                        </span>

                        <span>
                            {Number(course.pendingLessons) || 0} Pending
                        </span>
                    </div>

                    <Link
                        to={`/courses/${course.courseId}/learn`}
                        className="continue-learning-btn"
                    >
                        {completed ? "Review Course" : "Continue Learning"}
                        <span> →</span>
                    </Link>
                </div>
            </article>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="learner-dashboard-state">
                    <div className="learner-dashboard-spinner" />
                    <p>Loading your learning dashboard...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />

                <div className="learner-dashboard-state dashboard-error">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>

                    <button
                        className="dashboard-retry-btn"
                        onClick={fetchDashboard}
                    >
                        Try Again
                    </button>
                </div>
            </>
        );
    }

    if (!dashboard) {
        return (
            <>
                <Navbar />

                <div className="learner-dashboard-state">
                    <h2>Dashboard unavailable</h2>
                    <p>Unable to find your dashboard information.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="learner-dashboard">

                {/* Dashboard Header */}
                <section className="dashboard-header">
                    <div>
                        <span className="learner-dashboard-eyebrow">
                            YOUR LEARNING SPACE
                        </span>

                        <h1>
                            Welcome back, {dashboard.name || "Learner"}!
                        </h1>

                        <p>
                            Keep learning, make progress and achieve your goals.
                        </p>

                        <span className="dashboard-email">
                            {dashboard.email}
                        </span>
                    </div>

                    <Link
                        to="/#courses"
                        className="dashboard-explore-btn"
                    >
                        Explore Courses →
                    </Link>
                </section>

                {/* Statistics */}
                <section className="dashboard-stats">

                    <div className="stat-card">
                        <div className="learner-stat-icon blue">▤</div>
                        <div>
                            <h3>Enrolled Courses</h3>
                            <h2>
                                {dashboard.totalEnrolledCourses ?? courses.length}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="learner-stat-icon green">✓</div>
                        <div>
                            <h3>Completed Lessons</h3>
                            <h2>
                                {dashboard.totalCompletedLessons ?? 0}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="learner-stat-icon orange">◷</div>
                        <div>
                            <h3>Pending Lessons</h3>
                            <h2>
                                {dashboard.totalPendingLessons ?? 0}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="learner-stat-icon purple">★</div>
                        <div>
                            <h3>Completed Courses</h3>
                            <h2>{completedCourses.length}</h2>
                        </div>
                    </div>

                </section>

                {/* Overall Learning Progress */}
                <section className="overall-progress-card">
                    <div className="overall-progress-heading">
                        <div>
                            <span>YOUR PERFORMANCE</span>
                            <h2>Overall Learning Progress</h2>
                            <p>
                                Your combined progress across all enrolled courses.
                            </p>
                        </div>

                        <strong>{overallProgress}%</strong>
                    </div>

                    <div className="overall-progress-bar">
                        <div
                            className="overall-progress-fill"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>

                    <div className="overall-progress-footer">
                        <span>
                            {dashboard.totalCompletedLessons || 0} lessons completed
                        </span>
                        <span>
                            {dashboard.totalPendingLessons || 0} lessons remaining
                        </span>
                    </div>
                </section>

                {/* Continue Learning */}
                {continueCourse && (
                    <section className="continue-learning-section">
                        <div className="section-heading">
                            <div>
                                <h2>Continue Learning</h2>
                                <p>Pick up right where you left off.</p>
                            </div>
                        </div>

                        <div className="continue-learning-card">
                            <img
                                src={
                                    continueCourse.thumbnailUrl ||
                                    "https://placehold.co/600x350?text=Course"
                                }
                                alt={continueCourse.title || "Course"}
                                onError={handleImageError}
                            />

                            <div className="continue-learning-content">
                                <span className="course-category">
                                    {continueCourse.category || "General"}
                                </span>

                                <h3>{continueCourse.title}</h3>

                                <p>
                                    {continueCourse.completedLessons || 0} of{" "}
                                    {(Number(continueCourse.completedLessons) || 0) +
                                        (Number(continueCourse.pendingLessons) || 0)}
                                    {" "}lessons completed
                                </p>

                                <div className="course-progress-bar">
                                    <div
                                        className="course-progress-fill"
                                        style={{
                                            width: `${formatPercentage(
                                                continueCourse.completionPercentage
                                            )}%`
                                        }}
                                    />
                                </div>

                                <Link
                                    to={`/courses/${continueCourse.courseId}/learn`}
                                    className="continue-learning-btn"
                                >
                                    Resume Learning →
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* In Progress Courses */}
                <section className="enrolled-courses-section">
                    <div className="section-heading">
                        <div>
                            <h2>My Learning</h2>
                            <p>
                                Courses you're currently working on.
                            </p>
                        </div>

                        <span className="course-section-count">
                            {inProgressCourses.length} Courses
                        </span>
                    </div>

                    {inProgressCourses.length === 0 ? (
                        <div className="dashboard-empty">
                            <h3>No courses in progress</h3>
                            <p>
                                Explore available courses and start learning.
                            </p>

                            <Link
                                to="/#courses"
                                className="browse-courses-btn"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="enrolled-courses-grid">
                            {inProgressCourses.map(renderCourseCard)}
                        </div>
                    )}
                </section>

                {/* Completed Courses */}
                {completedCourses.length > 0 && (
                    <section className="enrolled-courses-section completed-courses-section">
                        <div className="section-heading">
                            <div>
                                <h2>Completed Courses</h2>
                                <p>
                                    Congratulations! Here's what you've finished.
                                </p>
                            </div>

                            <span className="completed-course-count">
                                {completedCourses.length} Completed
                            </span>
                        </div>

                        <div className="enrolled-courses-grid">
                            {completedCourses.map(renderCourseCard)}
                        </div>
                    </section>
                )}

            </main>
        </>
    );
}

export default LearnerDashboardTemp;
