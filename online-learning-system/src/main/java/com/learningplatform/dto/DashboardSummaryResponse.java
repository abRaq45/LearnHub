
package com.learningplatform.dto;

public record DashboardSummaryResponse(
        int totalEnrolledCourses,
        long totalCompletedLessons,
        long totalPendingLessons
) {
}
