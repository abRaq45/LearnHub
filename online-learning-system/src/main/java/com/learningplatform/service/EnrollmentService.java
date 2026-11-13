
package com.learningplatform.service;

import com.learningplatform.entity.Course;
import com.learningplatform.entity.Enrollment;
import com.learningplatform.entity.EnrollmentStatus;
import com.learningplatform.entity.User;
import com.learningplatform.repository.CourseRepository;
import com.learningplatform.repository.EnrollmentRepository;
import com.learningplatform.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository) {

        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    // Enroll learner in a course
    public Enrollment enrollInCourse(String email, String courseId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is deactivated"
            );
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Course not found"));

        var existingEnrollment =
                enrollmentRepository.findByUserIdAndCourseId(
                        user.getId(), course.getId());

        if (existingEnrollment.isPresent()) {

            Enrollment enrollment = existingEnrollment.get();

            if (enrollment.getStatus() == EnrollmentStatus.ACTIVE) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "You are already enrolled in this course");
            }

            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollment.setEnrollmentDate(Instant.now());

            return enrollmentRepository.save(enrollment);
        }

        Enrollment enrollment = new Enrollment(
                user.getId(),
                course.getId(),
                Instant.now(),
                EnrollmentStatus.ACTIVE
        );

        return enrollmentRepository.save(enrollment);
    }

    // Get logged-in learner's enrollments
    public List<Enrollment> getMyEnrollments(String email) {

        User user = getUserByEmail(email);

        return enrollmentRepository.findByUserId(user.getId());
    }

    // Get a particular enrollment
    public Enrollment getEnrollmentById(
            String email, String enrollmentId) {

        User user = getUserByEmail(email);

        return enrollmentRepository
                .findByIdAndUserId(enrollmentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enrollment not found"));
    }

    // Cancel learner's enrollment
    public Enrollment cancelEnrollment(
            String email, String enrollmentId) {

        User user = getUserByEmail(email);

        Enrollment enrollment = enrollmentRepository
                .findByIdAndUserId(enrollmentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enrollment not found"));

        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Enrollment is already cancelled");
        }

        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        return enrollmentRepository.save(enrollment);
    }

    // ==========================================
    // ADMIN ENROLLMENT MANAGEMENT
    // ==========================================

    // Get all enrollments
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    // Update enrollment status
    public Enrollment updateEnrollmentStatus(
            String enrollmentId,
            EnrollmentStatus status) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enrollment status is required"
            );
        }

        Enrollment enrollment = enrollmentRepository
                .findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enrollment not found"
                ));

        enrollment.setStatus(status);

        return enrollmentRepository.save(enrollment);
    }

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }
}
