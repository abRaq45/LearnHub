
import { Link } from "react-router-dom";

function CourseCard({ course }) {
    return (
        <div className="card h-100 shadow-sm border-0">
            <img
                src={course.thumbnailUrl || "https://placehold.co/600x350?text=Course"}
                className="card-img-top"
                alt={course.title}
                style={{ height: "200px", objectFit: "cover" }}
            />

            <div className="card-body d-flex flex-column">
                <span className="badge bg-primary align-self-start mb-2">
                    {course.category}
                </span>

                <h5 className="card-title fw-bold">
                    {course.title}
                </h5>

                <p className="card-text text-secondary">
                    {course.description}
                </p>

                <div className="mt-auto">
                    <p className="small text-muted mb-3">
                        Level: {course.difficultyLevel}
                    </p>

                    <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-outline-primary w-100"
                    >
                        View Course
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;
