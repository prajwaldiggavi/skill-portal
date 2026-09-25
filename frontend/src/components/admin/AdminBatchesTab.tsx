import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  X,
  RefreshCw,
  Eye,
  Award,
  BookOpen,
  CalendarCheck,
  FileCheck2
} from 'lucide-react';
import api from '../../api/client';
import { BatchItem, CourseItem, StudentAdminItem, BatchCreateRequest } from '../../types';

interface AdminBatchesTabProps {
  courses: CourseItem[];
  onBatchesUpdated?: () => void;
}

export const AdminBatchesTab: React.FC<AdminBatchesTabProps> = ({ courses, onBatchesUpdated }) => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [viewingStudentsBatch, setViewingStudentsBatch] = useState<BatchItem | null>(null);
  const [batchStudents, setBatchStudents] = useState<StudentAdminItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    courseId: courses.length > 0 ? courses[0].id : undefined as number | undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    active: true
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/batches');
      setBatches(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load batches', err);
      setError(err.response?.data?.message || 'Failed to load batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Batch Name and Code are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: BatchCreateRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        courseId: form.courseId,
        startDate: form.startDate,
        endDate: form.endDate,
        active: form.active
      };

      await api.post('/admin/batches', payload);
      setShowCreateModal(false);
      setForm({
        name: '',
        code: '',
        description: '',
        courseId: courses.length > 0 ? courses[0].id : undefined,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        active: true
      });
      showNotification('New batch created successfully!');
      fetchBatches();
      if (onBatchesUpdated) onBatchesUpdated();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    setFormError(null);

    setSubmitting(true);
    try {
      const payload: BatchCreateRequest = {
        name: editingBatch.name.trim(),
        code: editingBatch.code.trim().toUpperCase(),
        description: editingBatch.description || '',
        courseId: editingBatch.courseId,
        startDate: editingBatch.startDate,
        endDate: editingBatch.endDate,
        active: editingBatch.active
      };

      await api.put(`/admin/batches/${editingBatch.id}`, payload);
      setEditingBatch(null);
      showNotification('Batch details updated successfully!');
      fetchBatches();
      if (onBatchesUpdated) onBatchesUpdated();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (batch: BatchItem) => {
    const newStatus = !batch.active;
    try {
      await api.patch(`/admin/batches/${batch.id}/status`, { isActive: newStatus });
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, active: newStatus } : b))
      );
      showNotification(`Batch "${batch.name}" status updated.`);
      if (onBatchesUpdated) onBatchesUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update batch status.');
    }
  };

  const handleDeleteBatch = async (batchId: number, batchName: string) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"? Enrolled students will be unassigned.`)) {
      return;
    }
    try {
      await api.delete(`/admin/batches/${batchId}`);
      showNotification(`Batch "${batchName}" deleted.`);
      fetchBatches();
      if (onBatchesUpdated) onBatchesUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete batch.');
    }
  };

  const handleViewBatchStudents = async (batch: BatchItem) => {
    setViewingStudentsBatch(batch);
    setLoadingStudents(true);
    try {
      const res = await api.get(`/admin/batches/${batch.id}/students`);
      setBatchStudents(res.data?.data || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load batch students.');
    } finally {
      setLoadingStudents(false);
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
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cohort Batches & Academic Scheduling
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure student cohorts, associate curriculum tracks, set timeline dates, and track batch performance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchBatches()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Batches"
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
              <span>Create New Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          Loading cohorts and batch analytics...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          No cohorts found. Click "Create New Batch" to add your first cohort.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md font-mono font-black text-[10px] bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 uppercase">
                      {batch.code}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {batch.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(batch)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                      batch.active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                    title="Toggle Active Status"
                  >
                    {batch.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {batch.description || 'No batch description provided.'}
                </p>

                {batch.courseTitle && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{batch.courseTitle}</span>
                  </div>
                )}
              </div>

              {/* Batch Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Students</span>
                  <div className="font-black text-xs text-slate-900 dark:text-white mt-0.5">
                    {batch.totalStudents} ({batch.activeStudents} active)
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Attendance</span>
                  <div className="font-black text-xs text-emerald-600 mt-0.5">
                    {batch.averageAttendance}%
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Avg Test</span>
                  <div className="font-black text-xs text-cyan-400 mt-0.5">
                    {batch.averageTestScore}%
                  </div>
                </div>
              </div>

              {/* Timeline dates & actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{batch.startDate || 'Start'} to {batch.endDate || 'End'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewBatchStudents(batch)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Enrolled Students"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setFormError(null);
                      setEditingBatch({ ...batch });
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                    title="Edit Batch"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batch.id, batch.name)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE BATCH MODAL */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Create New Cohort Batch
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Full Stack Engineering Batch 2026-A"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="FS-2026-A"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Curriculum Track (Course)
                </label>
                <select
                  value={form.courseId || ''}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">No Course Assigned</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Batch learning goals, schedule timings, notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCohort"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="activeCohort" className="font-semibold text-slate-700 dark:text-slate-300">
                  Batch is currently active for enrollment
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT BATCH MODAL */}
      {/* ========================================================= */}
      {editingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Edit Batch Information
                </h3>
              </div>
              <button
                onClick={() => setEditingBatch(null)}
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

            <form onSubmit={handleUpdateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Code
                </label>
                <input
                  type="text"
                  required
                  value={editingBatch.code}
                  onChange={(e) => setEditingBatch({ ...editingBatch, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Curriculum Track (Course)
                </label>
                <select
                  value={editingBatch.courseId || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, courseId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">No Course Assigned</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingBatch.description || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingBatch.startDate || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editingBatch.endDate || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editActiveCohort"
                  checked={editingBatch.active}
                  onChange={(e) => setEditingBatch({ ...editingBatch, active: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="editActiveCohort" className="font-semibold text-slate-700 dark:text-slate-300">
                  Batch is currently active
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
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
      {/* VIEW BATCH STUDENTS MODAL */}
      {/* ========================================================= */}
      {viewingStudentsBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Learners Enrolled in {viewingStudentsBatch.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Batch Code: {viewingStudentsBatch.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentsBatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingStudents ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading enrolled students...</div>
              ) : batchStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No students enrolled in this batch yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {batchStudents.map((s) => (
                    <div key={s.userId} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[10px] font-mono text-brand-600 dark:text-brand-400">
                          {s.studentIdNumber} • {s.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {s.status}
                        </span>
                        <div className="text-[10px] font-black text-slate-400 mt-0.5">{s.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
