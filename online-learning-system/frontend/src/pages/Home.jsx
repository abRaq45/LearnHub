
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import { getAllCourses } from "../services/courseService";
import "./Home.css";

function Home() {

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllCourses();
            setCourses(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Failed to load courses:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load courses. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        {
            icon: "bi-code-slash",
            title: "Development",
            courses: "Programming & Web Development"
        },
        {
            icon: "bi-bar-chart-line",
            title: "Data Science",
            courses: "AI, ML & Data Analytics"
        },
        {
            icon: "bi-palette",
            title: "Design",
            courses: "UI/UX & Creative Design"
        },
        {
            icon: "bi-briefcase",
            title: "Business",
            courses: "Management & Entrepreneurship"
        }
    ];

    const features = [
        {
            icon: "bi-laptop",
            title: "Learn Anywhere",
            description: "Access your courses anytime and learn at your own pace."
        },
        {
            icon: "bi-person-video3",
            title: "Expert Instructors",
            description: "Learn from instructors who bring practical knowledge."
        },
        {
            icon: "bi-graph-up-arrow",
            title: "Track Your Progress",
            description: "Monitor completed lessons and your learning journey."
        }
    ];

    return (
        <>
            <Navbar />

            <main>

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="row align-items-center gy-5">

                            <div className="col-lg-6">

                                <span className="hero-badge">
                                    <i className="bi bi-stars me-2"></i>
                                    YOUR JOURNEY TO SUCCESS STARTS HERE
                                </span>

                                <h1 className="hero-title mt-4">
                                    Learn New Skills.
                                    <span className="text-primary d-block">
                                        Build Your Future.
                                    </span>
                                </h1>

                                <p className="hero-description mt-4">
                                    Discover new opportunities with quality
                                    online courses. Learn at your own pace,
                                    develop practical skills and achieve
                                    your career goals with LearnHub.
                                </p>

                                <div className="d-flex flex-wrap gap-3 mt-4">

                                    <Link
                                        to="/register"
                                        className="btn btn-primary btn-lg px-4"
                                    >
                                        Start Learning
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>

                                    <a
                                        href="#courses"
                                        className="btn btn-outline-primary btn-lg px-4"
                                    >
                                        Explore Courses
                                    </a>

                                </div>

                                <div className="hero-trust mt-4">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    Learn at your own pace
                                </div>

                            </div>

                            <div className="col-lg-6">

                                <div className="hero-image-wrapper">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000"
                                        alt="Students learning together"
                                        className="hero-image"
                                    />

                                    <div className="floating-card">
                                        <div className="floating-icon">
                                            <i className="bi bi-mortarboard-fill"></i>
                                        </div>

                                        <div>
                                            <h6 className="mb-0 fw-bold">
                                                Keep Learning
                                            </h6>
                                            <small className="text-muted">
                                                Build your future
                                            </small>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="stats-section">
                    <div className="container">
                        <div className="row text-center g-4">

                            <div className="col-6 col-lg-3">
                                <h2>100+</h2>
                                <p>Learning Resources</p>
                            </div>

                            <div className="col-6 col-lg-3">
                                <h2>50+</h2>
                                <p>Expert Instructors</p>
                            </div>

                            <div className="col-6 col-lg-3">
                                <h2>20+</h2>
                                <p>Course Categories</p>
                            </div>

                            <div className="col-6 col-lg-3">
                                <h2>24/7</h2>
                                <p>Learning Access</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="section-padding" id="categories">
                    <div className="container">

                        <div className="section-heading text-center">
                            <span className="section-label">
                                EXPLORE CATEGORIES
                            </span>

                            <h2>Find Your Area of Interest</h2>

                            <p>
                                Choose a learning path that matches your
                                interests and career goals.
                            </p>
                        </div>

                        <div className="row g-4 mt-3">

                            {categories.map((category, index) => (
                                <div className="col-sm-6 col-lg-3" key={index}>

                                    <div className="category-card h-100">

                                        <div className="category-icon">
                                            <i className={`bi ${category.icon}`}></i>
                                        </div>

                                        <h5>{category.title}</h5>

                                        <p>{category.courses}</p>

                                        <a href="#courses" className="category-link">
                                            Explore
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </a>

                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>
                </section>

                {/* Featured Courses Section */}
                <section className="section-padding featured-section" id="courses">
                    <div className="container">

                        <div className="section-heading text-center">
                            <span className="section-label">
                                START YOUR LEARNING JOURNEY
                            </span>

                            <h2>Discover New Skills</h2>

                            <p>
                                Explore learning opportunities and find
                                subjects that inspire you.
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>

                                <p className="mt-3 text-muted">
                                    Loading courses...
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {!loading && error && (
                            <div className="alert alert-danger text-center mt-4">
                                <i className="bi bi-exclamation-circle me-2"></i>
                                {error}

                                <div>
                                    <button
                                        className="btn btn-outline-danger btn-sm mt-3"
                                        onClick={fetchCourses}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && courses.length === 0 && (
                            <div className="row justify-content-center mt-4">
                                <div className="col-lg-8">
                                    <div className="course-placeholder text-center">

                                        <i className="bi bi-journals"></i>

                                        <h4 className="mt-3">
                                            No Courses Available Yet
                                        </h4>

                                        <p className="text-muted">
                                            We're preparing exciting learning
                                            opportunities. Please check back later.
                                        </p>

                                        <Link
                                            to="/register"
                                            className="btn btn-primary mt-2"
                                        >
                                            Join LearnHub
                                        </Link>

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Courses Display */}
                        {!loading && !error && courses.length > 0 && (
                            <>
                                <div className="row g-4 mt-3">

                                    {courses.map((course) => (
                                        <div
                                            className="col-sm-6 col-lg-4"
                                            key={course.id}
                                        >
                                            <CourseCard course={course} />
                                        </div>
                                    ))}

                                </div>

                                <div className="text-center mt-5">
                                    <p className="text-muted">
                                        Showing {courses.length} available
                                        {courses.length === 1 ? " course" : " courses"}
                                    </p>
                                </div>
                            </>
                        )}

                    </div>
                </section>

                {/* About / Features Section */}
                <section className="section-padding" id="about">
                    <div className="container">

                        <div className="section-heading text-center">
                            <span className="section-label">
                                WHY LEARNHUB?
                            </span>

                            <h2>A Better Way to Learn</h2>

                            <p>
                                Everything you need to make learning
                                simple, flexible and effective.
                            </p>
                        </div>

                        <div className="row g-4 mt-3">

                            {features.map((feature, index) => (
                                <div className="col-md-4" key={index}>

                                    <div className="feature-card text-center h-100">

                                        <div className="feature-icon">
                                            <i className={`bi ${feature.icon}`}></i>
                                        </div>

                                        <h5>{feature.title}</h5>

                                        <p>{feature.description}</p>

                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>
                </section>

                {/* Call To Action */}
                <section className="cta-section">
                    <div className="container text-center">

                        <h2>Ready to Start Learning?</h2>

                        <p>
                            Take the first step towards your goals.
                            Create your account and begin your journey today.
                        </p>

                        <Link
                            to="/register"
                            className="btn btn-light btn-lg px-5 mt-3"
                        >
                            Join LearnHub
                            <i className="bi bi-arrow-right ms-2"></i>
                        </Link>

                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="footer-section">
                <div className="container text-center">

                    <h4 className="fw-bold">
                        <i className="bi bi-mortarboard-fill me-2"></i>
                        LearnHub
                    </h4>

                    <p>
                        Empowering learners through accessible online education.
                    </p>

                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>

                    <hr />

                    <small>
                        © {new Date().getFullYear()} LearnHub.
                        All Rights Reserved.
                    </small>

                </div>
            </footer>

        </>
    );
}

export default Home;
