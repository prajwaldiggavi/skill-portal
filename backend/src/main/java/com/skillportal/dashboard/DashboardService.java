package com.skillportal.dashboard;

import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardDto.DashboardOverview getStudentDashboard(Long userId) {
        DashboardDto.DashboardOverview overview = new DashboardDto.DashboardOverview();
        overview.setMetrics(dashboardRepository.getMetrics(userId));
        overview.setResumeLearning(dashboardRepository.getResumeLearning(userId));
        overview.setStreak(dashboardRepository.getStreakInfo(userId));
        overview.setHeatmap(dashboardRepository.getActivityHeatmap(userId));
        overview.setLeaderboard(dashboardRepository.getLeaderboard(userId));
        overview.setRecentActivity(dashboardRepository.getRecentActivity(userId));
        overview.setUpcomingAssignments(dashboardRepository.getUpcomingAssignments());
        overview.setUpcomingTests(dashboardRepository.getUpcomingTests());
        return overview;
    }

    public DashboardDto.PersonalizedStudentDashboard getPersonalizedStudentDashboard(Long userId) {
        return dashboardRepository.getPersonalizedDashboard(userId);
    }
}
