
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getCourseById } from "../services/courseService";
import {
    enrollInCourse,
    getMyEnrollments
} from "../services/enrollmentService";

import { useAuth } from "../context/AuthContext";

import "./CourseDetails.css";

function CourseDetails() {

    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [enrollmentMessage, setEnrollmentMessage] = useState("");
    const [enrollmentError, setEnrollmentError] = useState("");

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if (isAuthenticated) {
            checkEnrollment();
        } else {
            setEnrolled(false);
        }
    }, [courseId, isAuthenticated]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCourseById(courseId);
            setCourse(data);

        } catch (err) {
            console.error("Error fetching course details:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load course details."
            );
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollment = async () => {
        try {
            const enrollments = await getMyEnrollments();

            const alreadyEnrolled = enrollments.some(
                (enrollment) =>
                    enrollment.courseId === courseId &&
                    enrollment.status === "ACTIVE"
            );

            setEnrolled(alreadyEnrolled);

        } catch (err) {
            console.error("Error checking enrollment:", err);
        }
    };

    const handleEnrollment = async () => {

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role?.toUpperCase() !== "LEARNER") {
            setEnrollmentError(
                "Only learners can enroll in courses."
            );
            return;
        }

        try {
            setEnrolling(true);
            setEnrollmentError("");
            setEnrollmentMessage("");

            await enrollInCourse(courseId);

            setEnrolled(true);

            setEnrollmentMessage(
                "Congratulations! You have successfully enrolled in this course."
            );

        } catch (err) {
            console.error("Enrollment failed:", err);

            setEnrollmentError(
                err.response?.data?.message ||
                "Unable to enroll. You may already be enrolled in this course."
            );

            // Refresh enrollment status in case the backend
            // reports that the learner is already enrolled.
            await checkEnrollment();

        } finally {
            setEnrolling(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="course-details-page">

                {loading && (
                    <div className="container text-center py-5">
                        <div className="spinner-border text-primary" />
                        <p className="mt-3">Loading course details...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="container py-5 text-center">
                        <div className="alert alert-danger">
                            {error}
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={fetchCourseDetails}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && !course && (
                    <div className="container text-center py-5">
                        <h3>Course Not Found</h3>

                        <Link to="/" className="btn btn-primary mt-3">
                            Explore Courses
                        </Link>
                    </div>
                )}

                {!loading && !error && course && (
                    <>
                        <section className="course-details-hero">
                            <div className="container">

                                <div className="mb-4">
                                    <Link to="/" className="back-link">
                                        <i className="bi bi-arrow-left me-2" />
                                        Back to Courses
                                    </Link>
                                </div>

                                <div className="row align-items-center g-5">

                                    <div className="col-lg-7">

                                        <span className="badge bg-light text-primary mb-3">
                                            {course.category}
                                        </span>

                                        <h1 className="course-details-title">
                                            {course.title}
                                        </h1>

                                        <p className="course-details-description mt-3">
                                            {course.description}
                                        </p>

                                        <div className="course-meta mt-4">
                                            <span>
                                                <i className="bi bi-bar-chart me-2" />
                                                {course.difficultyLevel}
                                            </span>

                                            <span>
                                                <i className="bi bi-person me-2" />
                                                Instructor
                                            </span>
                                        </div>

                                        {enrolled ? (
                                            <div className="mt-4">
                                                <div className="alert alert-success">
                                                    <i className="bi bi-check-circle-fill me-2" />
                                                    You are already enrolled in this course.
                                                </div>

                                                <Link
                                                    to="/dashboard"
                                                    className="btn btn-success btn-lg px-5"
                                                >
                                                    Go to Dashboard
                                                </Link>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-lg mt-4 px-5"
                                                onClick={handleEnrollment}
                                                disabled={enrolling}
                                            >
                                                {enrolling ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Enrolling...
                                                    </>
                                                ) : (
                                                    <>
                                                        Enroll Now
                                                        <i className="bi bi-arrow-right ms-2" />
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {enrollmentMessage && (
                                            <div className="alert alert-success mt-3">
                                                {enrollmentMessage}
                                            </div>
                                        )}

                                        {enrollmentError && (
                                            <div className="alert alert-danger mt-3">
                                                {enrollmentError}
                                            </div>
                                        )}

                                    </div>

                                    <div className="col-lg-5">

                                        <div className="course-details-image-wrapper">
                                            <img
                                                src={
                                                    course.thumbnailUrl ||
                                                    "https://placehold.co/600x350?text=Course"
                                                }
                                                alt={course.title}
                                                className="course-details-image"
                                            />
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </section>

                        <section className="section-padding">
                            <div className="container">

                                <div className="row g-5">

                                    <div className="col-lg-8">

                                        <h2 className="fw-bold mb-4">
                                            About This Course
                                        </h2>

                                        <p className="course-about-text">
                                            {course.description}
                                        </p>

                                        <div className="course-information-card mt-4">

                                            <h4 className="fw-bold mb-4">
                                                Course Information
                                            </h4>

                                            <div className="course-info-row">
                                                <span>Course Name</span>
                                                <strong>{course.title}</strong>
                                            </div>

                                            <div className="course-info-row">
                                                <span>Category</span>
                                                <strong>{course.category}</strong>
                                            </div>

                                            <div className="course-info-row">
                                                <span>Difficulty</span>
                                                <strong>{course.difficultyLevel}</strong>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="col-lg-4">

                                        <div className="course-sidebar-card">

                                            <i className="bi bi-mortarboard-fill course-sidebar-icon" />

                                            <h4 className="fw-bold mt-3">
                                                Start Learning Today
                                            </h4>

                                            <p className="text-muted">
                                                Enroll in this course and begin
                                                your learning journey.
                                            </p>

                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={handleEnrollment}
                                                disabled={enrolling || enrolled}
                                            >
                                                {enrolled
                                                    ? "Already Enrolled"
                                                    : enrolling
                                                        ? "Enrolling..."
                                                        : "Enroll Now"}
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </section>
                    </>
                )}

            </main>
        </>
    );
}

export default CourseDetails;
