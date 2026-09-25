import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Key,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  FileSpreadsheet,
  Code2,
  History,
  X,
  RefreshCw,
  Filter
} from 'lucide-react';
import api from '../../api/client';
import {
  StudentAdminItem,
  StudentDetailResponse,
  BatchItem,
  StudentCreateRequest,
  StudentUpdateRequest
} from '../../types';

interface AdminStudentsTabProps {
  batches: BatchItem[];
}

export const AdminStudentsTab: React.FC<AdminStudentsTabProps> = ({ batches }) => {
  const [students, setStudents] = useState<StudentAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAdminItem | null>(null);
  const [resetPwdStudent, setResetPwdStudent] = useState<StudentAdminItem | null>(null);
  const [viewingDetail, setViewingDetail] = useState<StudentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'attendance' | 'assignments' | 'tests' | 'coding' | 'activity'>('profile');

  // Form states for Add Student
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentIdNumber: '',
    phone: '',
    college: '',
    batchId: batches.length > 0 ? batches[0].id : 1,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { size: 100 };
      if (search.trim()) params.search = search.trim();
      if (selectedBatch !== 'ALL') params.batchId = Number(selectedBatch);
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch students', err);
      setError(err.response?.data?.message || 'Failed to fetch students roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Toggle student status
  const handleToggleStatus = async (student: StudentAdminItem) => {
    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/students/${student.userId}/status`, { status: newStatus });
      setStudents((prev) =>
        prev.map((s) => (s.userId === student.userId ? { ...s, status: newStatus } : s))
      );
      showNotification(`Student status updated to ${newStatus}.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student status.');
    }
  };

  // View student details
  const handleViewDetails = async (userId: number) => {
    setLoadingDetail(true);
    setDetailTab('profile');
    try {
      const res = await api.get(`/admin/students/${userId}`);
      setViewingDetail(res.data?.data || null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load student details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!addForm.fullName.trim() || addForm.fullName.trim().length < 3) {
      setFormError('Full name must be at least 3 characters.');
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!addForm.studentIdNumber.trim()) {
      setFormError('Student ID Number is required (e.g. STU-2026-005).');
      return;
    }
    if (addForm.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: StudentCreateRequest = {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        confirmPassword: addForm.confirmPassword,
        studentIdNumber: addForm.studentIdNumber.trim().toUpperCase(),
        studentCode: addForm.studentIdNumber.trim().toUpperCase(),
        phone: addForm.phone.trim(),
        college: addForm.college.trim(),
        batchId: Number(addForm.batchId),
      };

      await api.post('/admin/students', payload);
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentIdNumber: '',
        phone: '',
        college: '',
        batchId: batches.length > 0 ? batches[0].id : 1,
      });
      showNotification('New student account created successfully!');
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setFormError(null);

    setSubmitting(true);
    try {
      const payload: StudentUpdateRequest = {
        fullName: editingStudent.name.trim(),
        email: editingStudent.email.trim(),
        studentIdNumber: editingStudent.studentIdNumber.trim().toUpperCase(),
        studentCode: editingStudent.studentIdNumber.trim().toUpperCase(),
        phone: editingStudent.phone || '',
        college: editingStudent.college || '',
        batchId: editingStudent.batchId,
      };

      await api.put(`/admin/students/${editingStudent.userId}`, payload);
      setEditingStudent(null);
      showNotification('Student details updated successfully!');
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdStudent) return;
    setPwdError(null);

    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/admin/students/${resetPwdStudent.userId}/reset-password`, {
        newPassword,
      });
      setResetPwdStudent(null);
      setNewPassword('');
      setConfirmPassword('');
      showNotification(`Password for ${resetPwdStudent.name} was reset successfully!`);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to reset password.');
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

      {/* Roster Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Student Directory & Enrolled Cohorts
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student accounts, credentials, batch affiliations, and track academic records.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchStudents()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, student ID, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Batch Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Batches & Cohorts</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Learners Only</option>
              <option value="INACTIVE">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Loading student records...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No students found matching current search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Student ID</th>
                  <th className="pb-3">Batch & Course</th>
                  <th className="pb-3">Email & Contact</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center">Points</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{student.name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{student.college || 'College not specified'}</div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {student.studentIdNumber}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{student.batchName || 'General Batch'}</div>
                      <div className="text-[10px] text-slate-400">{student.courseTitle || 'Curriculum Track'}</div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <div>{student.email}</div>
                      {student.phone && <div className="text-[10px] text-slate-400">{student.phone}</div>}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {student.status}
                      </button>
                    </td>
                    <td className="py-3.5 text-center font-black text-brand-600 dark:text-brand-400">
                      {student.points} pts
                    </td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Details */}
                      <button
                        onClick={() => handleViewDetails(student.userId)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Complete Academic Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setFormError(null);
                          setEditingStudent({ ...student });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                        title="Edit Student Information"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setPwdError(null);
                          setNewPassword('');
                          setConfirmPassword('');
                          setResetPwdStudent(student);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                        title="Reset Account Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD STUDENT MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Enroll New Student Learner
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.studentIdNumber}
                    onChange={(e) => setAddForm({ ...addForm, studentIdNumber: e.target.value })}
                    placeholder="STU-2026-005"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Batch *
                </label>
                <select
                  value={addForm.batchId}
                  onChange={(e) => setAddForm({ ...addForm, batchId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={addForm.college}
                    onChange={(e) => setAddForm({ ...addForm, college: e.target.value })}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT STUDENT MODAL */}
      {/* ========================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Edit Student Profile
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student ID Code
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.studentIdNumber}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, studentIdNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Affiliation
                </label>
                <select
                  value={editingStudent.batchId || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, batchId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={editingStudent.college || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================================================= */}
      {resetPwdStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setResetPwdStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setting a new password for <span className="font-bold text-slate-800 dark:text-slate-200">{resetPwdStudent.name}</span> ({resetPwdStudent.email}).
            </p>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwdStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STUDENT DETAIL MODAL (6 SUBTABS) */}
      {/* ========================================================= */}
      {viewingDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black text-sm">
                  {viewingDetail.profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {viewingDetail.profile.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {viewingDetail.profile.studentIdNumber} • {viewingDetail.profile.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtabs navigation */}
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto text-xs shrink-0">
              <button
                onClick={() => setDetailTab('profile')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'profile'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setDetailTab('attendance')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'attendance'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Attendance ({viewingDetail.attendanceRecords?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('assignments')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'assignments'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Assignments ({viewingDetail.assignmentAttempts?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('tests')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'tests'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tests ({viewingDetail.testAttempts?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('coding')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'coding'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Coding Submissions ({viewingDetail.codingSubmissions?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('activity')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'activity'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activity Log</span>
              </button>
            </div>

            {/* Subtab content */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs">
              {detailTab === 'profile' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Batch</span>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {viewingDetail.profile.batchName || 'General Cohort'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum Track</span>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {viewingDetail.profile.courseTitle || 'Core Engineering Track'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">College / Campus</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingDetail.profile.college || 'N/A'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Points Earned</span>
                    <div className="font-black text-base text-brand-600 dark:text-brand-400">
                      {viewingDetail.profile.points} pts
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingDetail.profile.phone || 'N/A'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        viewingDetail.profile.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {viewingDetail.profile.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'attendance' && (
                <div className="space-y-2">
                  {(!viewingDetail.attendanceRecords || viewingDetail.attendanceRecords.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No attendance records logged yet.</div>
                  ) : (
                    viewingDetail.attendanceRecords.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{r.topic}</div>
                          <div className="text-[10px] text-slate-400">{r.sessionDate}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'assignments' && (
                <div className="space-y-2">
                  {(!viewingDetail.assignmentAttempts || viewingDetail.assignmentAttempts.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No assignment attempts recorded.</div>
                  ) : (
                    viewingDetail.assignmentAttempts.map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
                          <div className="text-[10px] text-slate-400">Status: {a.status}</div>
                        </div>
                        <div className="text-right font-black text-brand-600">
                          {a.marksObtained} / {a.totalMarks} Marks
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'tests' && (
                <div className="space-y-2">
                  {(!viewingDetail.testAttempts || viewingDetail.testAttempts.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No test attempts recorded.</div>
                  ) : (
                    viewingDetail.testAttempts.map((t, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                          <div className="text-[10px] text-slate-400">Submitted: {t.submittedAt || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-brand-600">{t.score} / {t.totalMarks} ({t.percentage}%)</div>
                          <span className="text-[10px] font-bold text-slate-400">{t.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'coding' && (
                <div className="space-y-2">
                  {(!viewingDetail.codingSubmissions || viewingDetail.codingSubmissions.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No coding submissions recorded.</div>
                  ) : (
                    viewingDetail.codingSubmissions.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{c.questionTitle}</div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">{c.language} • {c.runtimeMs} ms</div>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            c.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'activity' && (
                <div className="space-y-2">
                  {(!viewingDetail.activityLog || viewingDetail.activityLog.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No recent activity logged.</div>
                  ) : (
                    viewingDetail.activityLog.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{act.eventType}</div>
                          <div className="text-[10px] text-slate-400">{act.details}</div>
                        </div>
                        <div className="text-[10px] text-slate-400">{act.createdAt}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
