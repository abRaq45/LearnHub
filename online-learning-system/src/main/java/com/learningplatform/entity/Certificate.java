package com.learningplatform.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "certificates")
public class Certificate {

    @Id
    private String id;

    @Indexed(unique = true)
    private String certificateId;

    private String userId;
    private String userName;
    private String courseId;
    private String courseTitle;
    private Instant issuedAt;

    public Certificate() {
    }

    public Certificate(String certificateId,
                       String userId,
                       String userName,
                       String courseId,
                       String courseTitle,
                       Instant issuedAt) {
        this.certificateId = certificateId;
        this.userId = userId;
        this.userName = userName;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.issuedAt = issuedAt;
    }

    public String getId() {
        return id;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public String getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }
}