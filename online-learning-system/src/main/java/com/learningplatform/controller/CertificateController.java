
package com.learningplatform.controller;

import com.learningplatform.service.CertificateService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(
            CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // Download course completion certificate
    @GetMapping("/courses/{courseId}/download")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable String courseId,
            Authentication authentication) {

        byte[] pdf = certificateService.generateCertificatePdf(
                authentication.getName(),
                courseId
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=LearnHub-Certificate.pdf"
                )
                .contentLength(pdf.length)
                .body(pdf);
    }
}
