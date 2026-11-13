
package com.learningplatform.service;

import com.learningplatform.entity.Enrollment;
import com.learningplatform.entity.Role;
import com.learningplatform.entity.User;
import com.learningplatform.repository.EnrollmentRepository;
import com.learningplatform.repository.UserRepository;
import com.learningplatform.dto.UpdateProfileRequest;
import com.learningplatform.dto.ChangePasswordRequest;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        String email = user.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        // Public registration always assigns LEARNER.
        user.setRole(Role.LEARNER);
        user.setActive(true);

        return userRepository.save(user);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(
                email.trim().toLowerCase(Locale.ROOT)
        );
    }

    public User findByEmail(String email) {
        return findUserByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));
    }

    // Update the authenticated user's profile.
    public User updateProfile(
            String email,
            UpdateProfileRequest request) {

        User user = findByEmail(email);

        String name = request.name().trim();

        if (name.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name cannot be empty"
            );
        }

        user.setName(name);

        return userRepository.save(user);
    }

    // Change password after verifying the current password.
    public void changePassword(
            String email,
            ChangePasswordRequest request) {

        User user = findByEmail(email);

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New password must be different from current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);
    }

    public List<User> findUsersByName(String name) {
        return userRepository.findByName(name);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get all learners.
    public List<User> getAllLearners() {
        return userRepository.findByRole(Role.LEARNER);
    }

    // Get one learner.
    public User getLearnerById(String learnerId) {
        return userRepository.findByIdAndRole(
                learnerId,
                Role.LEARNER
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Learner not found"
                ));
    }

    // Get all enrollments belonging to a learner.
    public List<Enrollment> getLearnerEnrollments(
            String learnerId) {

        User learner = getLearnerById(learnerId);

        return enrollmentRepository.findByUserId(
                learner.getId()
        );
    }

    // Activate or deactivate a learner.
    public User updateLearnerStatus(
            String learnerId,
            Boolean active) {

        if (active == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Account status is required"
            );
        }

        User learner = getLearnerById(learnerId);

        learner.setActive(active);

        return userRepository.save(learner);
    }
}
