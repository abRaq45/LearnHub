
package com.learningplatform.repository;

import com.learningplatform.entity.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository
        extends MongoRepository<Enrollment, String> {

    Optional<Enrollment> findByUserIdAndCourseId(
            String userId, String courseId
    );

    List<Enrollment> findByUserId(String userId);

    Optional<Enrollment> findByIdAndUserId(
            String id, String userId
    );

    // Admin enrollment management
    List<Enrollment> findByStatus(
            com.learningplatform.entity.EnrollmentStatus status
    );
}
