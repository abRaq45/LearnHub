
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseDetails from "./pages/CourseDetails";

// Profile Page
import Profile from "./pages/Profile";

// Learner Pages
import LearnerDashboardTemp from "./pages/LearnerDashboardTemp";
import LessonLearning from "./pages/LessonLearning";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminLessons from "./pages/AdminLessons";
import AdminLearners from "./pages/AdminLearners";
import AdminEnrollments from "./pages/AdminEnrollments";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ================= PUBLIC ROUTES ================= */}

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/courses/:courseId"
                    element={<CourseDetails />}
                />


                {/* ================= AUTHENTICATED USER ROUTES ================= */}

                {/* Both ADMIN and LEARNER can access their own profile */}
                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                </Route>


                {/* ================= LEARNER ROUTES ================= */}

                <Route element={<ProtectedRoute allowedRoles={["LEARNER"]} />}>

                    <Route
                        path="/dashboard"
                        element={<LearnerDashboardTemp />}
                    />

                    <Route
                        path="/courses/:courseId/learn"
                        element={<LessonLearning />}
                    />

                </Route>


                {/* ================= ADMIN ROUTES ================= */}

                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/courses"
                        element={<AdminCourses />}
                    />

                    <Route
                        path="/admin/lessons"
                        element={<AdminLessons />}
                    />

                    <Route
                        path="/admin/learners"
                        element={<AdminLearners />}
                    />

                    <Route
                        path="/admin/enrollments"
                        element={<AdminEnrollments />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
