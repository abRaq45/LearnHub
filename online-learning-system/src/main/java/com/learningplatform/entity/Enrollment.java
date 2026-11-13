
package com.learningplatform.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "enrollments")
public class Enrollment {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private Instant enrollmentDate;
    private EnrollmentStatus status;

    public Enrollment() {
    }

    public Enrollment(String userId, String courseId,
                      Instant enrollmentDate,
                      EnrollmentStatus status) {
        this.userId = userId;
        this.courseId = courseId;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Instant getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(Instant enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }
}
