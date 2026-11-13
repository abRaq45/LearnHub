
package com.learningplatform.service;

import com.learningplatform.entity.*;
import com.learningplatform.repository.*;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CertificateService(
            CertificateRepository certificateRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository,
            EnrollmentRepository enrollmentRepository) {

        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // Create or retrieve a learner's certificate
    public Certificate getOrCreateCertificate(
            String email,
            String courseId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found"));

        Enrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not enrolled in this course"));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your course enrollment is not active");
        }

        // Return an existing certificate if already issued
        return certificateRepository
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> createCertificate(user, course));
    }

    // Validate completion and save certificate
    private Certificate createCertificate(
            User user,
            Course course) {

        int totalLessons = lessonRepository
                .findByCourseIdOrderByLessonOrderAsc(
                        course.getId()).size();

        if (totalLessons == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This course does not contain any lessons");
        }

        long completedLessons = progressRepository
                .countByUserIdAndCourseIdAndCompletedTrue(
                        user.getId(),
                        course.getId());

        if (completedLessons < totalLessons) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Complete all lessons before generating your certificate");
        }

        String certificateId = "LH-" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();

        Certificate certificate = new Certificate(
                certificateId,
                user.getId(),
                user.getName(),
                course.getId(),
                course.getTitle(),
                Instant.now()
        );

        return certificateRepository.save(certificate);
    }

    // Generate certificate PDF
    public byte[] generateCertificatePdf(
            String email,
            String courseId) {

        Certificate certificate =
                getOrCreateCertificate(email, courseId);

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Document document = new Document(
                    PageSize.A4.rotate(),
                    45, 45, 35, 35
            );

            PdfWriter writer =
                    PdfWriter.getInstance(document, outputStream);

            document.open();

            // Certificate border
            PdfContentByte canvas = writer.getDirectContent();

            canvas.setColorStroke(new Color(190, 150, 65));
            canvas.setLineWidth(3);

            canvas.rectangle(
                    20, 20,
                    PageSize.A4.rotate().getWidth() - 40,
                    PageSize.A4.rotate().getHeight() - 40
            );

            canvas.stroke();

            Font titleFont = new Font(
                    Font.HELVETICA,
                    34,
                    Font.BOLD,
                    new Color(25, 55, 95)
            );

            Font subtitleFont = new Font(
                    Font.HELVETICA,
                    16,
                    Font.NORMAL,
                    Color.DARK_GRAY
            );

            Font nameFont = new Font(
                    Font.HELVETICA,
                    28,
                    Font.BOLD,
                    new Color(180, 130, 40)
            );

            Font courseFont = new Font(
                    Font.HELVETICA,
                    22,
                    Font.BOLD,
                    new Color(25, 55, 95)
            );

            Font detailFont = new Font(
                    Font.HELVETICA,
                    11,
                    Font.NORMAL,
                    Color.DARK_GRAY
            );

            Paragraph title = new Paragraph(
                    "CERTIFICATE OF COMPLETION",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(35);
            title.setSpacingAfter(25);
            document.add(title);

            Paragraph platform = new Paragraph(
                    "LEARNHUB",
                    new Font(
                            Font.HELVETICA,
                            18,
                            Font.BOLD,
                            new Color(190, 150, 65)
                    )
            );

            platform.setAlignment(Element.ALIGN_CENTER);
            platform.setSpacingAfter(25);
            document.add(platform);

            Paragraph statement = new Paragraph(
                    "This certificate is proudly presented to",
                    subtitleFont
            );

            statement.setAlignment(Element.ALIGN_CENTER);
            statement.setSpacingAfter(18);
            document.add(statement);

            Paragraph learnerName = new Paragraph(
                    certificate.getUserName(),
                    nameFont
            );

            learnerName.setAlignment(Element.ALIGN_CENTER);
            learnerName.setSpacingAfter(18);
            document.add(learnerName);

            Paragraph completionText = new Paragraph(
                    "For successfully completing the course",
                    subtitleFont
            );

            completionText.setAlignment(Element.ALIGN_CENTER);
            completionText.setSpacingAfter(15);
            document.add(completionText);

            Paragraph courseTitle = new Paragraph(
                    certificate.getCourseTitle(),
                    courseFont
            );

            courseTitle.setAlignment(Element.ALIGN_CENTER);
            courseTitle.setSpacingAfter(30);
            document.add(courseTitle);

            String issueDate = DateTimeFormatter
                    .ofPattern("dd MMMM yyyy")
                    .withZone(ZoneId.systemDefault())
                    .format(certificate.getIssuedAt());

            Paragraph date = new Paragraph(
                    "Date of Completion: " + issueDate,
                    detailFont
            );

            date.setAlignment(Element.ALIGN_CENTER);
            date.setSpacingAfter(12);
            document.add(date);

            Paragraph certificateNumber = new Paragraph(
                    "Certificate ID: " +
                            certificate.getCertificateId(),
                    detailFont
            );

            certificateNumber.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(certificateNumber);

            Paragraph footer = new Paragraph(
                    "LearnHub | Online Learning & Course Management System",
                    new Font(
                            Font.HELVETICA,
                            10,
                            Font.ITALIC,
                            Color.GRAY
                    )
            );

            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to generate certificate PDF",
                    exception
            );
        }
    }
}
