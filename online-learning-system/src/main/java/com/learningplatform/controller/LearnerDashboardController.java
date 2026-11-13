
package com.learningplatform.controller;

import com.learningplatform.dto.DashboardSummaryResponse;
import com.learningplatform.dto.EnrolledCourseResponse;
import com.learningplatform.dto.LearnerDashboardResponse;
import com.learningplatform.service.LearnerDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard/learner")
public class LearnerDashboardController {

    private final LearnerDashboardService dashboardService;

    public LearnerDashboardController(
            LearnerDashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    // Get complete learner dashboard
    @GetMapping
    public ResponseEntity<LearnerDashboardResponse> getDashboard(
            Authentication authentication) {

        return ResponseEntity.ok(
                dashboardService.getDashboard(
                        authentication.getName()));
    }

    // Get enrolled courses with progress
    @GetMapping("/courses")
    public ResponseEntity<List<EnrolledCourseResponse>> getCourses(
            Authentication authentication) {

        return ResponseEntity.ok(
                dashboardService.getEnrolledCourses(
                        authentication.getName()));
    }

    // Get dashboard statistics
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            Authentication authentication) {

        return ResponseEntity.ok(
                dashboardService.getDashboardSummary(
                        authentication.getName()));
    }
}
