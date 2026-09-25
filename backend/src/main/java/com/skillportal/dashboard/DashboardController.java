package com.skillportal.dashboard;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Student Dashboard", description = "Endpoints for aggregated student statistics, streaks, heatmap, and leaderboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/v1/dashboard")
    @Operation(summary = "Get complete dashboard payload for authenticated student")
    public ResponseEntity<ApiResponse<DashboardDto.DashboardOverview>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardDto.DashboardOverview dashboard = dashboardService.getStudentDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping({"/api/v1/student/dashboard", "/api/v1/dashboard/student"})
    @Operation(summary = "Get personalized, strictly-isolated student dashboard for authenticated student")
    public ResponseEntity<ApiResponse<DashboardDto.PersonalizedStudentDashboard>> getPersonalizedDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardDto.PersonalizedStudentDashboard dashboard = dashboardService.getPersonalizedStudentDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
