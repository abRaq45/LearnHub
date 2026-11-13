
package com.learningplatform.dto;

import java.time.Instant;

public record EnrolledCourseResponse(
        String courseId,
        String title,
        String category,
        String difficultyLevel,
        String thumbnailUrl,
        Instant enrollmentDate,
        String status,
        int totalLessons,
        long completedLessons,
        long pendingLessons,
        double completionPercentage
) {
}
