
package com.learningplatform.dto;

import com.learningplatform.entity.Role;
import com.learningplatform.entity.User;

public record LearnerResponse(
        String id,
        String name,
        String email,
        Role role,
        boolean active,
        long totalEnrollments
) {
    public static LearnerResponse from(
            User user, long totalEnrollments) {

        return new LearnerResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                totalEnrollments
        );
    }
}
