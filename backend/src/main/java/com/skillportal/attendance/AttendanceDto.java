package com.skillportal.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AttendanceDto {

    public static class StudentAttendanceSummary {
        private double overallPercentage;
        private int totalClasses;
        private int presentClasses;
        private int absentClasses;
        private List<SubjectAttendanceStat> subjectWise;
        private List<AttendanceHistoryItem> history;

        public double getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }

        public int getAbsentClasses() { return absentClasses; }
        public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }

        public List<SubjectAttendanceStat> getSubjectWise() { return subjectWise; }
        public void setSubjectWise(List<SubjectAttendanceStat> subjectWise) { this.subjectWise = subjectWise; }

        public List<AttendanceHistoryItem> getHistory() { return history; }
        public void setHistory(List<AttendanceHistoryItem> history) { this.history = history; }
    }

    public static class SubjectAttendanceStat {
        private Long subjectId;
        private String subjectTitle;
        private int totalClasses;
        private int presentClasses;
        private double percentage;

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class AttendanceHistoryItem {
        private Long sessionId;
        private String sessionTitle;
        private String subjectTitle;
        private String sessionDate;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getSessionTitle() { return sessionTitle; }
        public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class CreateSessionRequest {
        @NotNull(message = "Batch ID is required")
        private Long batchId;

        private Long subjectId;

        @NotBlank(message = "Session title is required")
        private String title;

        @NotBlank(message = "Session date (YYYY-MM-DD) is required")
        private String sessionDate;

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    }

    public static class MarkRecordItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotBlank(message = "Status is required (PRESENT, ABSENT, LATE, EXCUSED)")
        private String status;

        private String remarks;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
