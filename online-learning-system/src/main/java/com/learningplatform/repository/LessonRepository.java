
package com.learningplatform.repository;

import com.learningplatform.entity.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LessonRepository
        extends MongoRepository<Lesson, String> {

    // Get all lessons of a particular course in lesson order
    List<Lesson> findByCourseIdOrderByLessonOrderAsc(String courseId);

    // Check whether a lesson order already exists in a course
    boolean existsByCourseIdAndLessonOrder(
            String courseId,
            int lessonOrder
    );

    // Check duplicate lesson order while excluding the current lesson
    boolean existsByCourseIdAndLessonOrderAndIdNot(
            String courseId,
            int lessonOrder,
            String id
    );
}
