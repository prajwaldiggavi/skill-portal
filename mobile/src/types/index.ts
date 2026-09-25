export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface StudentBasicInfo {
  id: number;
  studentIdNumber: string;
  fullName: string;
  email: string;
  batchName: string;
  avatarUrl?: string;
}

export interface QrScanResponse {
  attendanceStatus: 'PRESENT' | 'ALREADY_MARKED' | 'INVALID_QR' | 'INACTIVE_STUDENT' | 'REVOKED';
  message: string;
  student?: StudentBasicInfo;
  attendanceDate?: string;
  attendanceTime?: string;
  sessionId?: number;
  sessionTitle?: string;
  source?: string;
  markedAt?: string;
  existingMarkedAt?: string;
}

export interface TodayScanItem {
  recordId: number;
  studentId: number;
  studentIdNumber: string;
  studentName: string;
  batchName: string;
  status: string;
  scanTime: string;
  markedByAdminName: string;
  source: string;
  remarks?: string;
}

export interface AttendanceSessionItem {
  id: number;
  batchId: number;
  batchName: string;
  topic: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}
