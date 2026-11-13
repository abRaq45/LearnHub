
package com.learningplatform.controller;

import com.learningplatform.dto.UpdateEnrollmentStatusRequest;
import com.learningplatform.entity.Enrollment;
import com.learningplatform.service.EnrollmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // ==========================================
    // LEARNER ENDPOINTS
    // ==========================================

    // Enroll in a course
    @PostMapping("/{courseId}")
    public ResponseEntity<Enrollment> enrollInCourse(
            @PathVariable String courseId,
            Authentication authentication) {

        Enrollment enrollment = enrollmentService.enrollInCourse(
                authentication.getName(), courseId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollment);
    }

    // Get logged-in learner's enrollments
    @GetMapping("/my-courses")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(
            Authentication authentication) {

        return ResponseEntity.ok(
                enrollmentService.getMyEnrollments(
                        authentication.getName()));
    }

    // Get enrollment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(
            @PathVariable String id,
            Authentication authentication) {

        return ResponseEntity.ok(
                enrollmentService.getEnrollmentById(
                        authentication.getName(), id));
    }

    // Cancel enrollment
    @DeleteMapping("/{id}")
    public ResponseEntity<Enrollment> cancelEnrollment(
            @PathVariable String id,
            Authentication authentication) {

        return ResponseEntity.ok(
                enrollmentService.cancelEnrollment(
                        authentication.getName(), id));
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    // Get all enrollments
    @GetMapping("/admin")
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {

        return ResponseEntity.ok(
                enrollmentService.getAllEnrollments()
        );
    }

    // Update enrollment status
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<Enrollment> updateEnrollmentStatus(
            @PathVariable String id,
            @RequestBody UpdateEnrollmentStatusRequest request) {

        Enrollment enrollment =
                enrollmentService.updateEnrollmentStatus(
                        id,
                        request.status()
                );

        return ResponseEntity.ok(enrollment);
    }
}
