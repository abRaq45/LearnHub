
package com.learningplatform.repository;

import com.learningplatform.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CourseRepository
        extends MongoRepository<Course, String> {

    List<Course> findByCategoryIgnoreCase(String category);

    List<Course> findByDifficultyLevelIgnoreCase(
            String difficultyLevel);

    List<Course> findByInstructorId(String instructorId);

    List<Course> findByTitleContainingIgnoreCase(String title);
}
