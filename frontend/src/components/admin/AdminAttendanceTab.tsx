import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Users,
  Check,
  AlertTriangle,
  UserCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';
import {
  AttendanceSessionItem,
  StudentAttendanceMarkItem,
  AttendanceSessionCreateRequest,
  AttendanceMarkRequest,
  BatchItem
} from '../../types';

interface AdminAttendanceTabProps {
  batches: BatchItem[];
}

export const AdminAttendanceTab: React.FC<AdminAttendanceTabProps> = ({ batches }) => {
  const [sessions, setSessions] = useState<AttendanceSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');

  // Create Session Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    batchId: batches.length > 0 ? batches[0].id : 1,
    title: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
  });

  // Active Attendance Register (Live Sheet)
  const [activeSession, setActiveSession] = useState<AttendanceSessionItem | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceMarkItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingRecords, setSavingRecords] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (selectedBatch !== 'ALL') params.batchId = Number(selectedBatch);
      const res = await api.get('/admin/attendance/sessions', { params });
      setSessions(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load attendance sessions', err);
      setError(err.response?.data?.message || 'Failed to load attendance sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedBatch]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenRegister = async (session: AttendanceSessionItem) => {
    setActiveSession(session);
    setLoadingRecords(true);
    try {
      const res = await api.get(`/admin/attendance/sessions/${session.id}/records`);
      setAttendanceRecords(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load session records', err);
      alert(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleBulkMarkPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: 'PRESENT' as const }))
    );
  };

  const handleSetStudentStatus = (studentId: number, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleSetStudentRemarks = (studentId: number, remarks: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setSavingRecords(true);
    try {
      const payload: AttendanceMarkRequest = {
        sessionId: activeSession.id,
        records: attendanceRecords,
      };
      await api.post('/admin/attendance/records', payload);
      showNotification('Attendance records saved and committed successfully!');
      setActiveSession(null);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSavingRecords(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sessionForm.title.trim()) {
      setFormError('Session Title / Topic is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AttendanceSessionCreateRequest = {
        batchId: Number(sessionForm.batchId),
        title: sessionForm.title.trim(),
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime.length === 5 ? `${sessionForm.startTime}:00` : sessionForm.startTime,
        endTime: sessionForm.endTime.length === 5 ? `${sessionForm.endTime}:00` : sessionForm.endTime,
      };

      const res = await api.post('/admin/attendance/sessions', payload);
      const newSessionId = res.data?.data?.sessionId;
      setShowCreateModal(false);
      setSessionForm({
        batchId: batches.length > 0 ? batches[0].id : 1,
        title: '',
        sessionDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
      });
      showNotification('Attendance session created and roster initialized!');
      fetchSessions();

      // Automatically open the register for the new session
      if (newSessionId) {
        setTimeout(async () => {
          const detailRes = await api.get('/admin/attendance/sessions');
          const found = (detailRes.data?.data || []).find((s: AttendanceSessionItem) => s.id === newSessionId);
          if (found) {
            handleOpenRegister(found);
          }
        }, 300);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create attendance session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Attendance Register & Session Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Initiate live attendance sessions per batch, execute bulk check-ins, record tardiness or excusals, and sync with student attendance percentages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchSessions()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Sessions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Attendance Session</span>
            </button>
          </div>
        </div>

        {/* Batch Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="ALL">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid / Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading attendance register...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No attendance sessions found. Click "Create Attendance Session" to conduct a session.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {sessions.map((s) => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 font-bold">
                      {s.batchName}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {s.sessionDate}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {s.topic}
                  </h3>
                </div>

                {/* Metrics & Mark Button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-center text-[10px]">
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold">
                      {s.presentCount} Present
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold">
                      {s.absentCount} Absent
                    </div>
                    {s.lateCount > 0 && (
                      <div className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold">
                        {s.lateCount} Late
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenRegister(s)}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Open Register Sheet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* LIVE ATTENDANCE REGISTER SHEET MODAL */}
      {/* ========================================================= */}
      {activeSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Attendance Register: {activeSession.topic}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Cohort: {activeSession.batchName} • Date: {activeSession.sessionDate} • {attendanceRecords.length} Enrolled Students
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkMarkPresent}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  title="Mark all students as present"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
                <button
                  onClick={() => setActiveSession(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Records Sheet */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs">
              {loadingRecords ? (
                <div className="py-12 text-center text-slate-400">Loading student attendance records...</div>
              ) : attendanceRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No students found in this cohort.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {attendanceRecords.map((rec) => (
                    <div key={rec.studentId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {rec.studentName || `Student #${rec.studentId}`}
                        </div>
                        <div className="text-[10px] font-mono text-brand-600 dark:text-brand-400">
                          {rec.studentCode || `ID-${rec.studentId}`}
                        </div>
                      </div>

                      {/* Status Pills & Remarks */}
                      <div className="flex items-center gap-2">
                        {/* Status Toggle Buttons */}
                        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(rec.studentId, 'PRESENT')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                              rec.status === 'PRESENT'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(rec.studentId, 'ABSENT')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                              rec.status === 'ABSENT'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(rec.studentId, 'LATE')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                              rec.status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(rec.studentId, 'EXCUSED')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                              rec.status === 'EXCUSED'
                                ? 'bg-sky-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            E
                          </button>
                        </div>

                        {/* Remarks input */}
                        <input
                          type="text"
                          value={rec.remarks || ''}
                          onChange={(e) => handleSetStudentRemarks(rec.studentId, e.target.value)}
                          placeholder="Remarks / Reason..."
                          className="w-36 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                Close Without Saving
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={savingRecords}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingRecords ? 'Saving Register...' : 'Save & Commit Attendance'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE SESSION MODAL */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Create Attendance Session</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Cohort (Batch) *</label>
                <select
                  value={sessionForm.batchId}
                  onChange={(e) => setSessionForm({ ...sessionForm, batchId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Session Topic / Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="e.g. Session 14: Spring Security JWT Authentication"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Initialize Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
