
package com.learningplatform.dto;

import com.learningplatform.entity.EnrollmentStatus;

public record UpdateEnrollmentStatusRequest(
        EnrollmentStatus status
) {
}
