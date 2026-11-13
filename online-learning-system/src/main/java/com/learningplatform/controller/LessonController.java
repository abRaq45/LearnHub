
package com.learningplatform.controller;

import com.learningplatform.entity.Lesson;
import com.learningplatform.service.LessonService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    // Create a lesson for a course
    @PostMapping("/api/courses/{courseId}/lessons")
    public ResponseEntity<Lesson> createLesson(
            @PathVariable String courseId,
            @RequestBody Lesson lesson) {

        Lesson createdLesson =
                lessonService.createLesson(courseId, lesson);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createdLesson);
    }

    // Get all lessons belonging to a course
    @GetMapping("/api/courses/{courseId}/lessons")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(
            @PathVariable String courseId) {

        return ResponseEntity.ok(
                lessonService.getLessonsByCourse(courseId)
        );
    }

    // Get one lesson
    @GetMapping("/api/lessons/{id}")
    public ResponseEntity<Lesson> getLessonById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                lessonService.getLessonById(id)
        );
    }

    // Update a lesson
    @PutMapping("/api/lessons/{id}")
    public ResponseEntity<Lesson> updateLesson(
            @PathVariable String id,
            @RequestBody Lesson lesson) {

        return ResponseEntity.ok(
                lessonService.updateLesson(id, lesson)
        );
    }

    // Delete a lesson
    @DeleteMapping("/api/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable String id) {

        lessonService.deleteLesson(id);

        return ResponseEntity.noContent().build();
    }
}
