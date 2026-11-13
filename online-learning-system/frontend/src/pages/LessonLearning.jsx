
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
    getLessonsByCourse,
    getCourseProgress,
    markLessonCompleted
} from "../services/lessonService";

import certificateService from "../services/certificateService";

import "./LessonLearning.css";

// Convert YouTube URLs into embed URLs
const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== "string") {
        return null;
    }

    try {
        const parsedUrl = new URL(url.trim());

        const hostname = parsedUrl.hostname
            .toLowerCase()
            .replace(/^www\./, "");

        let videoId = null;

        if (hostname === "youtu.be") {
            videoId = parsedUrl.pathname
                .split("/")
                .filter(Boolean)[0];
        } else if (
            hostname === "youtube.com" ||
            hostname === "m.youtube.com" ||
            hostname === "youtube-nocookie.com"
        ) {
            const pathParts = parsedUrl.pathname
                .split("/")
                .filter(Boolean);

            if (parsedUrl.pathname === "/watch") {
                videoId = parsedUrl.searchParams.get("v");
            } else if (
                pathParts.length >= 2 &&
                ["embed", "shorts", "live"].includes(pathParts[0])
            ) {
                videoId = pathParts[1];
            }
        }

        if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return null;
        }

        const origin = window.location.origin;

        const embedUrl = new URL(
            `https://www.youtube.com/embed/${videoId}`
        );

        embedUrl.searchParams.set("enablejsapi", "1");
        embedUrl.searchParams.set("origin", origin);

        return embedUrl.toString();

    } catch {
        return null;
    }
};

function LessonLearning() {
    const { courseId } = useParams();

    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [marking, setMarking] = useState(false);

    const [downloadingCertificate, setDownloadingCertificate] =
        useState(false);

    const currentLesson = lessons[currentLessonIndex];

    const completedLessonIds = new Set(
        (progress?.lessonProgress || [])
            .filter(item => item.completed)
            .map(item => item.lessonId)
    );

    // Load lessons and progress
    useEffect(() => {
        const loadLearningData = async () => {
            try {
                setLoading(true);
                setError("");

                const [lessonData, progressData] = await Promise.all([
                    getLessonsByCourse(courseId),
                    getCourseProgress(courseId)
                ]);

                setLessons(lessonData);
                setProgress(progressData);
                setCurrentLessonIndex(0);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load course lessons."
                );
            } finally {
                setLoading(false);
            }
        };

        loadLearningData();
    }, [courseId]);

    // Mark current lesson completed
    const handleMarkCompleted = async () => {
        if (
            !currentLesson ||
            completedLessonIds.has(currentLesson.id)
        ) {
            return;
        }

        try {
            setMarking(true);
            setError("");
            setSuccess("");

            await markLessonCompleted(courseId, currentLesson.id);

            const updatedProgress = await getCourseProgress(courseId);

            setProgress(updatedProgress);
            setSuccess("Lesson marked as completed successfully!");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update lesson progress."
            );
        } finally {
            setMarking(false);
        }
    };

    // Download certificate
    const handleDownloadCertificate = async () => {
        try {
            setDownloadingCertificate(true);
            setError("");
            setSuccess("");

            const pdfBlob =
                await certificateService.downloadCertificate(courseId);

            const pdfUrl = window.URL.createObjectURL(
                new Blob([pdfBlob], {
                    type: "application/pdf"
                })
            );

            const downloadLink = document.createElement("a");

            downloadLink.href = pdfUrl;
            downloadLink.download = "LearnHub-Certificate.pdf";

            document.body.appendChild(downloadLink);
            downloadLink.click();

            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(pdfUrl);

            setSuccess("Your certificate has been downloaded successfully!");

        } catch (err) {
            let errorMessage = "Unable to download your certificate.";

            if (err.response?.data instanceof Blob) {
                try {
                    const errorText = await err.response.data.text();
                    const errorData = JSON.parse(errorText);

                    errorMessage =
                        errorData.message || errorMessage;
                } catch {
                    // Keep the default error message
                }
            } else {
                errorMessage =
                    err.response?.data?.message || errorMessage;
            }

            setError(errorMessage);

        } finally {
            setDownloadingCertificate(false);
        }
    };

    // Navigate between lessons
    const goToLesson = (index) => {
        if (index >= 0 && index < lessons.length) {
            setCurrentLessonIndex(index);
            setSuccess("");
            setError("");
        }
    };

    // Loading state
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="learning-loading">
                    Loading your lessons...
                </div>
            </>
        );
    }

    // Error state
    if (error && lessons.length === 0) {
        return (
            <>
                <Navbar />
                <div className="learning-error">
                    <h3>Unable to load course</h3>
                    <p>{error}</p>
                    <Link to="/dashboard">Back to Dashboard</Link>
                </div>
            </>
        );
    }

    // Empty lessons state
    if (lessons.length === 0) {
        return (
            <>
                <Navbar />
                <div className="learning-empty">
                    <h3>No lessons available yet</h3>
                    <p>
                        Your instructor has not added lessons to this course.
                    </p>
                    <Link to="/dashboard">Back to Dashboard</Link>
                </div>
            </>
        );
    }

    if (!currentLesson) {
        return (
            <>
                <Navbar />
                <div className="learning-error">
                    Unable to find the selected lesson.
                    <Link to="/dashboard">Back to Dashboard</Link>
                </div>
            </>
        );
    }

    const percentage = Math.min(
        100,
        Math.max(0, Number(progress?.completionPercentage) || 0)
    );

    const isCompleted = completedLessonIds.has(currentLesson.id);

    const courseCompleted =
        lessons.length > 0 &&
        percentage >= 100 &&
        Number(progress?.completedLessons) >= lessons.length;

    const youtubeEmbedUrl = getYouTubeEmbedUrl(
        currentLesson.videoUrl
    );

    return (
        <>
            <Navbar />

            <div className="learning-page">

                {/* Learning Header */}
                <header className="learning-header">

                    <Link to="/dashboard" className="back-link">
                        ← Dashboard
                    </Link>

                    <h2>Course Learning</h2>

                    <span>
                        {progress?.completedLessons || 0} / {lessons.length} Completed
                    </span>

                </header>

                {/* Course Progress */}
                <div className="learning-progress">

                    <div className="learning-progress-info">
                        <span>Course Progress</span>
                        <strong>{percentage.toFixed(1)}%</strong>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                </div>

                {/* Certificate Section */}
                {courseCompleted && (
                    <section className="certificate-section">

                        <div className="certificate-info">
                            <span className="certificate-icon">
                                🎓
                            </span>

                            <div>
                                <h3>Congratulations!</h3>
                                <p>
                                    You have successfully completed this course.
                                    Your certificate is ready.
                                </p>
                            </div>
                        </div>

                        <button
                            className="certificate-download-btn"
                            onClick={handleDownloadCertificate}
                            disabled={downloadingCertificate}
                        >
                            {downloadingCertificate
                                ? "Generating Certificate..."
                                : "↓ Download Certificate"}
                        </button>

                    </section>
                )}

                {/* Main Learning Layout */}
                <div className="learning-layout">

                    {/* Lesson Sidebar */}
                    <aside className="lesson-sidebar">

                        <h3>Course Content</h3>

                        <p className="lesson-count">
                            {lessons.length} Lessons
                        </p>

                        {lessons.map((lesson, index) => {

                            const completed = completedLessonIds.has(lesson.id);

                            return (
                                <button
                                    key={lesson.id}
                                    className={`lesson-list-item ${
                                        currentLessonIndex === index
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => goToLesson(index)}
                                >
                                    <span className="lesson-number">
                                        {completed ? "✓" : index + 1}
                                    </span>

                                    <span className="lesson-list-title">
                                        {lesson.title}
                                    </span>

                                </button>
                            );
                        })}

                    </aside>

                    {/* Lesson Content */}
                    <main className="lesson-main">

                        <div className="lesson-heading">

                            <span>
                                Lesson {currentLessonIndex + 1} of {lessons.length}
                            </span>

                            <h1>{currentLesson.title}</h1>

                        </div>

                        {/* YouTube Video Player */}
                        {currentLesson.videoUrl ? (

                            youtubeEmbedUrl ? (

                                <>
                                    <div className="lesson-video">

                                        <iframe
                                            key={currentLesson.id}
                                            src={youtubeEmbedUrl}
                                            title={currentLesson.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />

                                    </div>

                                    <div className="youtube-fallback">
                                        <a
                                            href={currentLesson.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Watch this video on YouTube
                                        </a>
                                    </div>
                                </>

                            ) : (

                                <div className="no-video">
                                    <span>Invalid YouTube URL</span>
                                    <p>
                                        Please contact the administrator to update
                                        the video link for this lesson.
                                    </p>
                                </div>

                            )

                        ) : (

                            <div className="no-video">
                                <span>Video unavailable</span>
                                <p>
                                    No YouTube video has been added to this lesson.
                                </p>
                            </div>

                        )}

                        {/* Lesson Description */}
                        <section className="lesson-content">

                            <h3>About this Lesson</h3>

                            <p>
                                {currentLesson.content ||
                                    "No additional lesson content available."}
                            </p>

                        </section>

                        {/* Success and Error Messages */}
                        {error && (
                            <div className="learning-alert error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="learning-alert success">
                                {success}
                            </div>
                        )}

                        {/* Lesson Navigation */}
                        <div className="lesson-actions">

                            <button
                                className="previous-btn"
                                disabled={currentLessonIndex === 0 || marking}
                                onClick={() =>
                                    goToLesson(currentLessonIndex - 1)
                                }
                            >
                                ← Previous
                            </button>

                            <button
                                className="complete-btn"
                                disabled={isCompleted || marking}
                                onClick={handleMarkCompleted}
                            >
                                {marking
                                    ? "Updating..."
                                    : isCompleted
                                        ? "✓ Completed"
                                        : "Mark as Complete"}
                            </button>

                            <button
                                className="next-btn"
                                disabled={
                                    currentLessonIndex === lessons.length - 1 ||
                                    marking
                                }
                                onClick={() =>
                                    goToLesson(currentLessonIndex + 1)
                                }
                            >
                                Next →
                            </button>

                        </div>

                    </main>

                </div>

            </div>
        </>
    );
}

export default LessonLearning;
