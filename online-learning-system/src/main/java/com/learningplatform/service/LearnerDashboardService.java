
package com.learningplatform.service;

import com.learningplatform.dto.DashboardSummaryResponse;
import com.learningplatform.dto.EnrolledCourseResponse;
import com.learningplatform.dto.LearnerDashboardResponse;

import com.learningplatform.entity.Course;
import com.learningplatform.entity.Enrollment;
import com.learningplatform.entity.EnrollmentStatus;
import com.learningplatform.entity.Lesson;
import com.learningplatform.entity.User;

import com.learningplatform.repository.CourseRepository;
import com.learningplatform.repository.EnrollmentRepository;
import com.learningplatform.repository.LessonProgressRepository;
import com.learningplatform.repository.LessonRepository;
import com.learningplatform.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LearnerDashboardService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;

    public LearnerDashboardService(
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository) {

        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
    }

    // Get complete learner dashboard
    public LearnerDashboardResponse getDashboard(String email) {

        User user = getUser(email);

        List<EnrolledCourseResponse> courses =
                buildEnrolledCourses(user.getId());

        int totalCourses = courses.size();

        long completedLessons = courses.stream()
                .mapToLong(EnrolledCourseResponse::completedLessons)
                .sum();

        long pendingLessons = courses.stream()
                .mapToLong(EnrolledCourseResponse::pendingLessons)
                .sum();

        return new LearnerDashboardResponse(
                user.getName(),
                user.getEmail(),
                totalCourses,
                completedLessons,
                pendingLessons,
                courses
        );
    }

    // Get all active enrolled courses with progress
    public List<EnrolledCourseResponse> getEnrolledCourses(String email) {

        User user = getUser(email);

        return buildEnrolledCourses(user.getId());
    }

    // Get dashboard summary
    public DashboardSummaryResponse getDashboardSummary(String email) {

        LearnerDashboardResponse dashboard = getDashboard(email);

        return new DashboardSummaryResponse(
                dashboard.totalEnrolledCourses(),
                dashboard.totalCompletedLessons(),
                dashboard.totalPendingLessons()
        );
    }

    // Build enrolled course details for a learner
    private List<EnrolledCourseResponse> buildEnrolledCourses(String userId) {

        List<Enrollment> enrollments =
                enrollmentRepository.findByUserId(userId);

        return enrollments.stream()
                .filter(enrollment ->
                        enrollment.getStatus() == EnrollmentStatus.ACTIVE)
                .map(this::buildCourseResponse)
                .toList();
    }

    // Calculate progress for one enrolled course
    private EnrolledCourseResponse buildCourseResponse(
            Enrollment enrollment) {

        String courseId = enrollment.getCourseId();
        String userId = enrollment.getUserId();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found: " + courseId
                ));

        List<Lesson> lessons =
                lessonRepository.findByCourseIdOrderByLessonOrderAsc(
                        courseId
                );

        int totalLessons = lessons.size();

        long completedLessons = progressRepository
                .countByUserIdAndCourseIdAndCompletedTrue(
                        userId,
                        courseId
                );

        // Protect against inconsistent progress data
        completedLessons = Math.min(completedLessons, totalLessons);

        long pendingLessons = totalLessons - completedLessons;

        double percentage = totalLessons == 0
                ? 0.0
                : (completedLessons * 100.0) / totalLessons;

        double completionPercentage =
                Math.round(percentage * 100.0) / 100.0;

        return new EnrolledCourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCategory(),
                course.getDifficultyLevel(),
                course.getThumbnailUrl(),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus().name(),
                totalLessons,
                completedLessons,
                pendingLessons,
                completionPercentage
        );
    }

    // Find logged-in learner
    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }
}
