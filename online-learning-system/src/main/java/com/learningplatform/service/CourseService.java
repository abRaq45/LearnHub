
package com.learningplatform.service;

import com.learningplatform.entity.Course;
import com.learningplatform.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Create a new course
    public Course createCourse(Course course) {
        course.setId(null);

        Instant now = Instant.now();
        course.setCreatedAt(now);
        course.setUpdatedAt(now);

        return courseRepository.save(course);
    }

    // Get all courses
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Get a course by ID
    public Course getCourseById(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Course not found: " + id
                        )
                );
    }

    // Update an existing course
    public Course updateCourse(String id, Course updatedCourse) {
        Course existingCourse = getCourseById(id);

        existingCourse.setTitle(updatedCourse.getTitle());
        existingCourse.setDescription(updatedCourse.getDescription());
        existingCourse.setCategory(updatedCourse.getCategory());
        existingCourse.setDifficultyLevel(
                updatedCourse.getDifficultyLevel()
        );
        existingCourse.setThumbnailUrl(updatedCourse.getThumbnailUrl());
        existingCourse.setUpdatedAt(Instant.now());

        return courseRepository.save(existingCourse);
    }

    // Delete a course
    public void deleteCourse(String id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

    // Get courses by category
    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategoryIgnoreCase(category);
    }

    // Get courses by difficulty level
    public List<Course> getCoursesByDifficulty(String difficulty) {
        return courseRepository
                .findByDifficultyLevelIgnoreCase(difficulty);
    }

    // Search courses by title
    public List<Course> searchCourses(String title) {
        return courseRepository
                .findByTitleContainingIgnoreCase(title);
    }

    // Get courses by instructor ID
    public List<Course> getCoursesByInstructor(String instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }
}
