
package com.learningplatform.controller;

import com.learningplatform.entity.Course;
import com.learningplatform.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @RequestBody Course course) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(course));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(
            @PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable String id,
            @RequestBody Course course) {
        return ResponseEntity.ok(
                courseService.updateCourse(id, course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Course>> getByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(
                courseService.getCoursesByCategory(category));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Course>> getByDifficulty(
            @PathVariable String difficulty) {
        return ResponseEntity.ok(
                courseService.getCoursesByDifficulty(difficulty));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(
            @RequestParam String title) {
        return ResponseEntity.ok(
                courseService.searchCourses(title));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Course>> getByInstructor(
            @PathVariable String instructorId) {
        return ResponseEntity.ok(
                courseService.getCoursesByInstructor(instructorId));
    }
}
