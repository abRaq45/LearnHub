
package com.learningplatform.dto;

import com.learningplatform.entity.LessonProgress;

import java.util.List;

public record CourseProgressResponse(
        String courseId,
        int totalLessons,
        long completedLessons,
        double completionPercentage,
        List<LessonProgress> lessonProgress
) {
}
