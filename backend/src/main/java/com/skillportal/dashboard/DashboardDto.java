package com.skillportal.dashboard;

import java.util.List;
import java.util.Map;

public class DashboardDto {

    public static class DashboardOverview {
        private MetricsSummary metrics;
        private ResumeLearning resumeLearning;
        private StreakInfo streak;
        private List<ActivityHeatmapDay> heatmap;
        private LeaderboardSummary leaderboard;
        private List<RecentActivityItem> recentActivity;
        private List<UpcomingItem> upcomingAssignments;
        private List<UpcomingItem> upcomingTests;

        public MetricsSummary getMetrics() { return metrics; }
        public void setMetrics(MetricsSummary metrics) { this.metrics = metrics; }

        public ResumeLearning getResumeLearning() { return resumeLearning; }
        public void setResumeLearning(ResumeLearning resumeLearning) { this.resumeLearning = resumeLearning; }

        public StreakInfo getStreak() { return streak; }
        public void setStreak(StreakInfo streak) { this.streak = streak; }

        public List<ActivityHeatmapDay> getHeatmap() { return heatmap; }
        public void setHeatmap(List<ActivityHeatmapDay> heatmap) { this.heatmap = heatmap; }

        public LeaderboardSummary getLeaderboard() { return leaderboard; }
        public void setLeaderboard(LeaderboardSummary leaderboard) { this.leaderboard = leaderboard; }

        public List<RecentActivityItem> getRecentActivity() { return recentActivity; }
        public void setRecentActivity(List<RecentActivityItem> recentActivity) { this.recentActivity = recentActivity; }

        public List<UpcomingItem> getUpcomingAssignments() { return upcomingAssignments; }
        public void setUpcomingAssignments(List<UpcomingItem> upcomingAssignments) { this.upcomingAssignments = upcomingAssignments; }

        public List<UpcomingItem> getUpcomingTests() { return upcomingTests; }
        public void setUpcomingTests(List<UpcomingItem> upcomingTests) { this.upcomingTests = upcomingTests; }
    }

    public static class MetricsSummary {
        private double courseProgressPercentage;
        private double assignmentProgressPercentage;
        private double testAveragePercentage;
        private double attendancePercentage;
        private int totalPoints;
        private int solvedQuestions;
        private int completedVideos;

        public double getCourseProgressPercentage() { return courseProgressPercentage; }
        public void setCourseProgressPercentage(double courseProgressPercentage) { this.courseProgressPercentage = courseProgressPercentage; }

        public double getAssignmentProgressPercentage() { return assignmentProgressPercentage; }
        public void setAssignmentProgressPercentage(double assignmentProgressPercentage) { this.assignmentProgressPercentage = assignmentProgressPercentage; }

        public double getTestAveragePercentage() { return testAveragePercentage; }
        public void setTestAveragePercentage(double testAveragePercentage) { this.testAveragePercentage = testAveragePercentage; }

        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

        public int getTotalPoints() { return totalPoints; }
        public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

        public int getSolvedQuestions() { return solvedQuestions; }
        public void setSolvedQuestions(int solvedQuestions) { this.solvedQuestions = solvedQuestions; }

        public int getCompletedVideos() { return completedVideos; }
        public void setCompletedVideos(int completedVideos) { this.completedVideos = completedVideos; }
    }

    public static class ResumeLearning {
        private Long courseId;
        private String courseTitle;
        private Long topicId;
        private String topicTitle;
        private Long videoId;
        private String videoTitle;
        private double watchedPercentage;
        private String continueUrl;

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTopicTitle() { return topicTitle; }
        public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }

        public Long getVideoId() { return videoId; }
        public void setVideoId(Long videoId) { this.videoId = videoId; }

        public String getVideoTitle() { return videoTitle; }
        public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }

        public double getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(double watchedPercentage) { this.watchedPercentage = watchedPercentage; }

        public String getContinueUrl() { return continueUrl; }
        public void setContinueUrl(String continueUrl) { this.continueUrl = continueUrl; }
    }

    public static class StreakInfo {
        private int currentStreak;
        private int longestStreak;
        private int correctSubmissions;
        private int totalSubmissions;

        public int getCurrentStreak() { return currentStreak; }
        public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

        public int getLongestStreak() { return longestStreak; }
        public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

        public int getCorrectSubmissions() { return correctSubmissions; }
        public void setCorrectSubmissions(int correctSubmissions) { this.correctSubmissions = correctSubmissions; }

        public int getTotalSubmissions() { return totalSubmissions; }
        public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    }

    public static class ActivityHeatmapDay {
        private String date; // YYYY-MM-DD
        private int count;

        public ActivityHeatmapDay() {}

        public ActivityHeatmapDay(String date, int count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public static class LeaderboardSummary {
        private List<LeaderboardStudent> topStudents;
        private int currentUserRank;
        private int currentUserPoints;

        public List<LeaderboardStudent> getTopStudents() { return topStudents; }
        public void setTopStudents(List<LeaderboardStudent> topStudents) { this.topStudents = topStudents; }

        public int getCurrentUserRank() { return currentUserRank; }
        public void setCurrentUserRank(int currentUserRank) { this.currentUserRank = currentUserRank; }

        public int getCurrentUserPoints() { return currentUserPoints; }
        public void setCurrentUserPoints(int currentUserPoints) { this.currentUserPoints = currentUserPoints; }
    }

    public static class LeaderboardStudent {
        private int rank;
        private Long userId;
        private String name;
        private String avatarUrl;
        private int points;
        private String batchName;

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }
    }

    public static class RecentActivityItem {
        private String eventType;
        private String title;
        private String timestamp;
        private String linkUrl;

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

        public String getLinkUrl() { return linkUrl; }
        public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    }

    public static class UpcomingItem {
        private Long id;
        private String title;
        private String type; // ASSIGNMENT, TEST
        private String deadline;
        private String linkUrl;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }

        public String getLinkUrl() { return linkUrl; }
        public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    }

    public static class PersonalizedStudentDashboard {
        private StudentProfileInfo student;
        private PersonalLearningStatistics statistics;
        private StudentAttendanceSummary attendanceSummary;
        private List<RecentActivityItem> recentActivity;
        private List<StudentAssignmentItem> assignments;
        private List<StudentTestResultItem> testResults;
        private List<StudentCodingHistoryItem> codingHistory;
        private List<SubjectPerformanceItem> subjectPerformance;
        private List<ModuleProgressItem> courseProgress;
        private List<ActivityHeatmapDay> activityHeatmap;
        private List<UpcomingItem> notifications;

        public StudentProfileInfo getStudent() { return student; }
        public void setStudent(StudentProfileInfo student) { this.student = student; }

        public PersonalLearningStatistics getStatistics() { return statistics; }
        public void setStatistics(PersonalLearningStatistics statistics) { this.statistics = statistics; }

        public StudentAttendanceSummary getAttendanceSummary() { return attendanceSummary; }
        public void setAttendanceSummary(StudentAttendanceSummary attendanceSummary) { this.attendanceSummary = attendanceSummary; }

        public List<RecentActivityItem> getRecentActivity() { return recentActivity; }
        public void setRecentActivity(List<RecentActivityItem> recentActivity) { this.recentActivity = recentActivity; }

        public List<StudentAssignmentItem> getAssignments() { return assignments; }
        public void setAssignments(List<StudentAssignmentItem> assignments) { this.assignments = assignments; }

        public List<StudentTestResultItem> getTestResults() { return testResults; }
        public void setTestResults(List<StudentTestResultItem> testResults) { this.testResults = testResults; }

        public List<StudentCodingHistoryItem> getCodingHistory() { return codingHistory; }
        public void setCodingHistory(List<StudentCodingHistoryItem> codingHistory) { this.codingHistory = codingHistory; }

        public List<SubjectPerformanceItem> getSubjectPerformance() { return subjectPerformance; }
        public void setSubjectPerformance(List<SubjectPerformanceItem> subjectPerformance) { this.subjectPerformance = subjectPerformance; }

        public List<ModuleProgressItem> getCourseProgress() { return courseProgress; }
        public void setCourseProgress(List<ModuleProgressItem> courseProgress) { this.courseProgress = courseProgress; }

        public List<ActivityHeatmapDay> getActivityHeatmap() { return activityHeatmap; }
        public void setActivityHeatmap(List<ActivityHeatmapDay> activityHeatmap) { this.activityHeatmap = activityHeatmap; }

        public List<UpcomingItem> getNotifications() { return notifications; }
        public void setNotifications(List<UpcomingItem> notifications) { this.notifications = notifications; }
    }

    public static class StudentProfileInfo {
        private String name;
        private String studentCode;
        private String batch;
        private String course;
        private String college;
        private String semesterOrYear;
        private String phone;
        private String email;
        private String avatarUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getStudentCode() { return studentCode; }
        public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public String getCourse() { return course; }
        public void setCourse(String course) { this.course = course; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public String getSemesterOrYear() { return semesterOrYear; }
        public void setSemesterOrYear(String semesterOrYear) { this.semesterOrYear = semesterOrYear; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class PersonalLearningStatistics {
        private int practiceDays;
        private int currentStreak;
        private int longestStreak;
        private String practiceTime;
        private int problemsSolved;
        private int problemsAttempted;
        private double acceptanceRate;
        private int assignmentsCompleted;
        private int assignmentsTotal;
        private int testsCompleted;
        private double averageTestPercentage;
        private int totalMarks;
        private int totalPossibleMarks;
        private double overallPercentage;
        private double courseProgress;
        private double attendancePercentage;
        private int points;

        public int getPracticeDays() { return practiceDays; }
        public void setPracticeDays(int practiceDays) { this.practiceDays = practiceDays; }

        public int getCurrentStreak() { return currentStreak; }
        public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

        public int getLongestStreak() { return longestStreak; }
        public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

        public String getPracticeTime() { return practiceTime; }
        public void setPracticeTime(String practiceTime) { this.practiceTime = practiceTime; }

        public int getProblemsSolved() { return problemsSolved; }
        public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }

        public int getProblemsAttempted() { return problemsAttempted; }
        public void setProblemsAttempted(int problemsAttempted) { this.problemsAttempted = problemsAttempted; }

        public double getAcceptanceRate() { return acceptanceRate; }
        public void setAcceptanceRate(double acceptanceRate) { this.acceptanceRate = acceptanceRate; }

        public int getAssignmentsCompleted() { return assignmentsCompleted; }
        public void setAssignmentsCompleted(int assignmentsCompleted) { this.assignmentsCompleted = assignmentsCompleted; }

        public int getAssignmentsTotal() { return assignmentsTotal; }
        public void setAssignmentsTotal(int assignmentsTotal) { this.assignmentsTotal = assignmentsTotal; }

        public int getTestsCompleted() { return testsCompleted; }
        public void setTestsCompleted(int testsCompleted) { this.testsCompleted = testsCompleted; }

        public double getAverageTestPercentage() { return averageTestPercentage; }
        public void setAverageTestPercentage(double averageTestPercentage) { this.averageTestPercentage = averageTestPercentage; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getTotalPossibleMarks() { return totalPossibleMarks; }
        public void setTotalPossibleMarks(int totalPossibleMarks) { this.totalPossibleMarks = totalPossibleMarks; }

        public double getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

        public double getCourseProgress() { return courseProgress; }
        public void setCourseProgress(double courseProgress) { this.courseProgress = courseProgress; }

        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }
    }

    public static class StudentAttendanceSummary {
        private double overallPercentage;
        private int presentCount;
        private int absentCount;
        private int lateCount;
        private int excusedCount;
        private int totalSessions;

        public double getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

        public int getAbsentCount() { return absentCount; }
        public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

        public int getLateCount() { return lateCount; }
        public void setLateCount(int lateCount) { this.lateCount = lateCount; }

        public int getExcusedCount() { return excusedCount; }
        public void setExcusedCount(int excusedCount) { this.excusedCount = excusedCount; }

        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
    }

    public static class SubjectPerformanceItem {
        private String subjectName;
        private double assignmentsPercentage;
        private double testsPercentage;
        private double codingPercentage;

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public double getAssignmentsPercentage() { return assignmentsPercentage; }
        public void setAssignmentsPercentage(double assignmentsPercentage) { this.assignmentsPercentage = assignmentsPercentage; }

        public double getTestsPercentage() { return testsPercentage; }
        public void setTestsPercentage(double testsPercentage) { this.testsPercentage = testsPercentage; }

        public double getCodingPercentage() { return codingPercentage; }
        public void setCodingPercentage(double codingPercentage) { this.codingPercentage = codingPercentage; }
    }

    public static class ModuleProgressItem {
        private String moduleName;
        private double completionPercentage;

        public String getModuleName() { return moduleName; }
        public void setModuleName(String moduleName) { this.moduleName = moduleName; }

        public double getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(double completionPercentage) { this.completionPercentage = completionPercentage; }
    }

    public static class StudentAssignmentItem {
        private Long id;
        private String title;
        private String subjectTitle;
        private String dueDate;
        private String status;
        private int score;
        private int totalMarks;
        private double percentage;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class StudentTestResultItem {
        private Long id;
        private String title;
        private String date;
        private int score;
        private int totalMarks;
        private double percentage;
        private int correct;
        private int incorrect;
        private int unanswered;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public int getCorrect() { return correct; }
        public void setCorrect(int correct) { this.correct = correct; }

        public int getIncorrect() { return incorrect; }
        public void setIncorrect(int incorrect) { this.incorrect = incorrect; }

        public int getUnanswered() { return unanswered; }
        public void setUnanswered(int unanswered) { this.unanswered = unanswered; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StudentCodingHistoryItem {
        private Long submissionId;
        private String problemTitle;
        private String language;
        private String status;
        private int runtimeMs;
        private String submittedAt;

        public Long getSubmissionId() { return submissionId; }
        public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

        public String getProblemTitle() { return problemTitle; }
        public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }
}
