
package com.learningplatform.service;

import com.learningplatform.entity.Lesson;
import com.learningplatform.repository.CourseRepository;
import com.learningplatform.repository.LessonRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    public LessonService(
            LessonRepository lessonRepository,
            CourseRepository courseRepository) {

        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
    }

    // Create a lesson for an existing course
    public Lesson createLesson(String courseId, Lesson lesson) {

        validateCourse(courseId);

        if (lesson.getTitle() == null
                || lesson.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson title is required"
            );
        }

        if (lesson.getLessonOrder() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson order must be at least 1"
            );
        }

        if (lessonRepository.existsByCourseIdAndLessonOrder(
                courseId, lesson.getLessonOrder())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This lesson order is already used in the course"
            );
        }

        lesson.setId(null);
        lesson.setCourseId(courseId);

        Instant now = Instant.now();
        lesson.setCreatedAt(now);
        lesson.setUpdatedAt(now);

        return lessonRepository.save(lesson);
    }

    // Get all lessons for a course, in order
    public List<Lesson> getLessonsByCourse(String courseId) {

        validateCourse(courseId);

        return lessonRepository
                .findByCourseIdOrderByLessonOrderAsc(courseId);
    }

    // Get a lesson by ID
    public Lesson getLessonById(String id) {

        return lessonRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Lesson not found: " + id
                        )
                );
    }

    // Update an existing lesson
    public Lesson updateLesson(String id, Lesson updatedLesson) {

        Lesson existingLesson = getLessonById(id);

        if (updatedLesson.getTitle() == null
                || updatedLesson.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson title is required"
            );
        }

        if (updatedLesson.getLessonOrder() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lesson order must be at least 1"
            );
        }

        if (lessonRepository.existsByCourseIdAndLessonOrderAndIdNot(
                existingLesson.getCourseId(),
                updatedLesson.getLessonOrder(),
                id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This lesson order is already used in the course"
            );
        }

        existingLesson.setTitle(updatedLesson.getTitle());
        existingLesson.setContent(updatedLesson.getContent());
        existingLesson.setVideoUrl(updatedLesson.getVideoUrl());
        existingLesson.setLessonOrder(updatedLesson.getLessonOrder());
        existingLesson.setUpdatedAt(Instant.now());

        return lessonRepository.save(existingLesson);
    }

    // Delete a lesson
    public void deleteLesson(String id) {

        Lesson lesson = getLessonById(id);
        lessonRepository.delete(lesson);
    }

    // Validate course existence
    private void validateCourse(String courseId) {

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Course not found: " + courseId
            );
        }
    }
}
