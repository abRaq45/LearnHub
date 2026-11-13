package com.learningplatform.dto;

import java.time.Instant;

public record CertificateResponse(
        String certificateId,
        String userName,
        String courseId,
        String courseTitle,
        Instant issuedAt
) {
}