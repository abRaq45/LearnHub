package com.learningplatform.repository;

import com.learningplatform.entity.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CertificateRepository
        extends MongoRepository<Certificate, String> {

    Optional<Certificate> findByUserIdAndCourseId(
            String userId,
            String courseId
    );

    Optional<Certificate> findByCertificateId(
            String certificateId
    );

    boolean existsByUserIdAndCourseId(
            String userId,
            String courseId
    );
}