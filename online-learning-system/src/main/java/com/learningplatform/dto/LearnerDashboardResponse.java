
package com.learningplatform.dto;

import java.util.List;

public record LearnerDashboardResponse(
        String name,
        String email,
        int totalEnrolledCourses,
        long totalCompletedLessons,
        long totalPendingLessons,
        List<EnrolledCourseResponse> courses
) {
}
