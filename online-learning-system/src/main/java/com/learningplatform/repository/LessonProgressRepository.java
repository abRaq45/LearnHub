
package com.learningplatform.repository;

import com.learningplatform.entity.LessonProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository
        extends MongoRepository<LessonProgress, String> {

    // Find progress for a particular lesson
    Optional<LessonProgress> findByUserIdAndCourseIdAndLessonId(
            String userId,
            String courseId,
            String lessonId
    );

    // Get all lesson progress records for a learner in a course
    List<LessonProgress> findByUserIdAndCourseId(
            String userId,
            String courseId
    );

    // Count completed lessons
    long countByUserIdAndCourseIdAndCompletedTrue(
            String userId,
            String courseId
    );
}
