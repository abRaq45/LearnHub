
package com.learningplatform.service;

import com.learningplatform.dto.CourseProgressResponse;
import com.learningplatform.entity.*;
import com.learningplatform.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class LessonProgressService {

    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    public LessonProgressService(
            LessonProgressRepository progressRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            EnrollmentRepository enrollmentRepository) {

        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // Mark a lesson as completed
    public LessonProgress markLessonCompleted(
            String email,
            String courseId,
            String lessonId) {

        User user = getUser(email);

        // Check whether course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found"));

        // Check whether lesson exists
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lesson not found"));

        // Check whether lesson belongs to the course
        if (!lesson.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson does not belong to this course");
        }

        // Check active enrollment
        Enrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not enrolled in this course"));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your course enrollment is not active");
        }

        // Check whether progress already exists
        LessonProgress progress = progressRepository
                .findByUserIdAndCourseIdAndLessonId(
                        user.getId(), courseId, lessonId)
                .orElseGet(() -> new LessonProgress(
                        user.getId(),
                        courseId,
                        lessonId,
                        false,
                        null
                ));

        // Mark lesson as completed
        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(Instant.now());
        }

        return progressRepository.save(progress);
    }

    // Get course progress for the logged-in learner
    public CourseProgressResponse getCourseProgress(
            String email,
            String courseId) {

        User user = getUser(email);

        // Check whether course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found"));

        // Check active enrollment
        Enrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not enrolled in this course"));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your course enrollment is not active");
        }

        // Get all lessons belonging to this course
        List<Lesson> lessons =
                lessonRepository.findByCourseIdOrderByLessonOrderAsc(
                        courseId);

        // Get all progress records for this learner and course
        List<LessonProgress> progressList =
                progressRepository.findByUserIdAndCourseId(
                        user.getId(), courseId);

        // Calculate total and completed lessons
        int totalLessons = lessons.size();

        long completedLessons = progressRepository
                .countByUserIdAndCourseIdAndCompletedTrue(
                        user.getId(), courseId);

        // Calculate completion percentage
        double percentage = totalLessons == 0
                ? 0.0
                : (completedLessons * 100.0) / totalLessons;

        double completionPercentage =
                Math.round(percentage * 100.0) / 100.0;

        return new CourseProgressResponse(
                courseId,
                totalLessons,
                completedLessons,
                completionPercentage,
                progressList
        );
    }

    // Find user using authenticated email
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }
}
