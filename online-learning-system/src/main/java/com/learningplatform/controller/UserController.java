
package com.learningplatform.controller;

import com.learningplatform.dto.RegisterRequest;
import com.learningplatform.dto.UserResponse;
import com.learningplatform.dto.LearnerResponse;
import com.learningplatform.dto.UpdateLearnerStatusRequest;
import com.learningplatform.dto.UpdateProfileRequest;
import com.learningplatform.dto.ChangePasswordRequest;

import com.learningplatform.entity.Role;
import com.learningplatform.entity.User;
import com.learningplatform.entity.Enrollment;

import com.learningplatform.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register a new learner.
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest request) {

        User user = new User(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                request.password(),
                Role.LEARNER
        );

        User savedUser = userService.registerUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponse.from(savedUser));
    }

    // Search users by exact name.
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> findUsersByName(
            @RequestParam String name) {

        List<UserResponse> users = userService
                .findUsersByName(name.trim())
                .stream()
                .map(UserResponse::from)
                .toList();

        return ResponseEntity.ok(users);
    }

    // Get all users.
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::from)
                .toList();

        return ResponseEntity.ok(users);
    }

    // Get current authenticated user's profile.
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        User user = userService.findByEmail(
                authentication.getName()
        );

        return ResponseEntity.ok(UserResponse.from(user));
    }

    // Update current authenticated user's profile.
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        User updatedUser = userService.updateProfile(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(UserResponse.from(updatedUser));
    }

    // Change current authenticated user's password.
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                Map.of("message", "Password updated successfully")
        );
    }

    // ==========================================
    // ADMIN - LEARNER MANAGEMENT
    // ==========================================

    // Get all learners with enrollment counts.
    @GetMapping("/learners")
    public ResponseEntity<List<LearnerResponse>> getAllLearners() {

        List<LearnerResponse> learners = userService
                .getAllLearners()
                .stream()
                .map(learner -> LearnerResponse.from(
                        learner,
                        userService.getLearnerEnrollments(
                                learner.getId()
                        ).size()
                ))
                .toList();

        return ResponseEntity.ok(learners);
    }

    // Get a particular learner.
    @GetMapping("/learners/{id}")
    public ResponseEntity<LearnerResponse> getLearnerById(
            @PathVariable String id) {

        User learner = userService.getLearnerById(id);

        long enrollmentCount = userService
                .getLearnerEnrollments(id)
                .size();

        return ResponseEntity.ok(
                LearnerResponse.from(learner, enrollmentCount)
        );
    }

    // Get all course enrollments of a learner.
    @GetMapping("/learners/{id}/enrollments")
    public ResponseEntity<List<Enrollment>> getLearnerEnrollments(
            @PathVariable String id) {

        return ResponseEntity.ok(
                userService.getLearnerEnrollments(id)
        );
    }

    // Activate or deactivate a learner.
    @PatchMapping("/learners/{id}/status")
    public ResponseEntity<LearnerResponse> updateLearnerStatus(
            @PathVariable String id,
            @RequestBody UpdateLearnerStatusRequest request) {

        User learner = userService.updateLearnerStatus(
                id,
                request.active()
        );

        long enrollmentCount = userService
                .getLearnerEnrollments(id)
                .size();

        return ResponseEntity.ok(
                LearnerResponse.from(learner, enrollmentCount)
        );
    }
}
