package com.skillportal.attendance;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Tracking", description = "Endpoints for student attendance overview and admin session marking")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    @Operation(summary = "Get overall, subject-wise, and chronological attendance for logged-in student")
    public ResponseEntity<ApiResponse<AttendanceDto.StudentAttendanceSummary>> getAttendance(
            @AuthenticationPrincipal UserPrincipal principal) {
        AttendanceDto.StudentAttendanceSummary summary = attendanceService.getStudentAttendance(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new attendance session")
    public ResponseEntity<ApiResponse<Long>> createSession(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceDto.CreateSessionRequest request) {
        Long sessionId = attendanceService.createSession(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance session created", sessionId));
    }

    @PostMapping("/sessions/{sessionId}/records")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Mark attendance records for a batch")
    public ResponseEntity<ApiResponse<Void>> markRecords(
            @PathVariable Long sessionId,
            @Valid @RequestBody List<AttendanceDto.MarkRecordItem> records) {
        attendanceService.markBatchAttendance(sessionId, records);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", null));
    }
}
