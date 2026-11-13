
package com.learningplatform.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "lessons")
public class Lesson {

    @Id
    private String id;

    private String courseId;
    private String title;
    private String content;
    private String videoUrl;
    private int lessonOrder;
    private Instant createdAt;
    private Instant updatedAt;

    public Lesson() {
    }

    public Lesson(
            String courseId,
            String title,
            String content,
            String videoUrl,
            int lessonOrder) {
        this.courseId = courseId;
        this.title = title;
        this.content = content;
        this.videoUrl = videoUrl;
        this.lessonOrder = lessonOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public int getLessonOrder() {
        return lessonOrder;
    }

    public void setLessonOrder(int lessonOrder) {
        this.lessonOrder = lessonOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
