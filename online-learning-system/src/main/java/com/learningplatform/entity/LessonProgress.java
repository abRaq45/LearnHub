
package com.learningplatform.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "lesson_progress")
public class LessonProgress {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private String lessonId;
    private boolean completed;
    private Instant completedAt;

    public LessonProgress() {
    }

    public LessonProgress(String userId, String courseId,
                          String lessonId, boolean completed,
                          Instant completedAt) {
        this.userId = userId;
        this.courseId = courseId;
        this.lessonId = lessonId;
        this.completed = completed;
        this.completedAt = completedAt;
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

    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
