
package com.learningplatform.controller;

import com.learningplatform.dto.CourseProgressResponse;
import com.learningplatform.entity.LessonProgress;
import com.learningplatform.service.LessonProgressService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class LessonProgressController {

    private final LessonProgressService progressService;

    public LessonProgressController(
            LessonProgressService progressService) {
        this.progressService = progressService;
    }

    // Mark a lesson as completed
    @PutMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<LessonProgress> markLessonCompleted(
            @PathVariable String courseId,
            @PathVariable String lessonId,
            Authentication authentication) {

        LessonProgress progress =
                progressService.markLessonCompleted(
                        authentication.getName(),
                        courseId,
                        lessonId
                );

        return ResponseEntity.ok(progress);
    }

    // Get course progress
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable String courseId,
            Authentication authentication) {

        return ResponseEntity.ok(
                progressService.getCourseProgress(
                        authentication.getName(),
                        courseId
                )
        );
    }
}
