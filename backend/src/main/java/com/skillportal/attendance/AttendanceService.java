package com.skillportal.attendance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public AttendanceDto.StudentAttendanceSummary getStudentAttendance(Long userId) {
        return attendanceRepository.getStudentAttendanceSummary(userId);
    }

    @Transactional
    public Long createSession(Long adminUserId, AttendanceDto.CreateSessionRequest req) {
        return attendanceRepository.createSession(adminUserId, req);
    }

    @Transactional
    public void markBatchAttendance(Long sessionId, List<AttendanceDto.MarkRecordItem> records) {
        for (AttendanceDto.MarkRecordItem r : records) {
            attendanceRepository.markAttendance(sessionId, r.getStudentId(), r.getStatus(), r.getRemarks());
        }
    }
}
