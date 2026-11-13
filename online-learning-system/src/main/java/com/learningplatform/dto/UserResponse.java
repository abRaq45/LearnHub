
package com.learningplatform.dto;

import com.learningplatform.entity.Role;
import com.learningplatform.entity.User;

public record UserResponse(
        String id,
        String name,
        String email,
        Role role,
        boolean active
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        );
    }
}
