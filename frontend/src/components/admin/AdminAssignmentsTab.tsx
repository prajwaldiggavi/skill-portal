import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
  Award,
  Clock,
  BookOpen,
  Users
} from 'lucide-react';
import api from '../../api/client';
import {
  AssignmentAdminItem,
  AssignmentCreateRequest,
  CourseItem,
  BatchItem,
  QuestionBankItem
} from '../../types';

interface AdminAssignmentsTabProps {
  courses: CourseItem[];
  batches: BatchItem[];
}

export const AdminAssignmentsTab: React.FC<AdminAssignmentsTabProps> = ({ courses, batches }) => {
  const [assignments, setAssignments] = useState<AssignmentAdminItem[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Assignment Wizard Modal
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form Basic Info
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: courses.length > 0 ? courses[0].id : undefined as number | undefined,
    batchId: batches.length > 0 ? batches[0].id : undefined as number | undefined,
    difficulty: 'MEDIUM',
    totalMarks: 50,
    passingMarks: 20,
    maxAttempts: 3,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    published: true,
  });

  // Multi-sections builder state
  const [sections, setSections] = useState<Array<{
    title: string;
    description: string;
    sectionNumber: number;
    questionIds: number[];
  }>>([
    { title: 'Section 1: Core Concepts', description: 'Fundamental questions', sectionNumber: 1, questionIds: [] },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, qRes] = await Promise.all([
        api.get('/admin/assignments'),
        api.get('/admin/questions')
      ]);
      setAssignments(assignRes.data?.data || []);
      setQuestions(qRes.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load assignments', err);
      setError(err.response?.data?.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteAssignment = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      showNotification('Assignment deleted successfully.');
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete assignment.');
    }
  };

  const handleAddSection = () => {
    const num = sections.length + 1;
    setSections([
      ...sections,
      { title: `Section ${num}: Practical Problems`, description: 'Hands-on evaluation', sectionNumber: num, questionIds: [] }
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      alert('An assignment must have at least one section.');
      return;
    }
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleToggleQuestionInSection = (sectionIdx: number, questionId: number) => {
    const updated = [...sections];
    const currentQIds = updated[sectionIdx].questionIds;
    if (currentQIds.includes(questionId)) {
      updated[sectionIdx].questionIds = currentQIds.filter((id) => id !== questionId);
    } else {
      updated[sectionIdx].questionIds = [...currentQIds, questionId];
    }
    setSections(updated);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Assignment title is required.');
      return;
    }

    const hasQuestions = sections.some((s) => s.questionIds.length > 0);
    if (!hasQuestions) {
      setFormError('Please select at least one question from the Question Bank across sections.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AssignmentCreateRequest = {
        title: form.title.trim(),
        description: form.description.trim(),
        courseId: form.courseId,
        batchId: form.batchId,
        difficulty: form.difficulty,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        maxAttempts: Number(form.maxAttempts),
        startDate: form.startDate,
        dueDate: form.dueDate,
        published: form.published,
        sections: sections.map((s, idx) => ({
          title: s.title.trim(),
          description: s.description.trim(),
          sectionNumber: idx + 1,
          questionIds: s.questionIds,
        })),
      };

      await api.post('/admin/assignments', payload);
      setShowWizard(false);
      setStep(1);
      setForm({
        title: '',
        description: '',
        courseId: courses.length > 0 ? courses[0].id : undefined,
        batchId: batches.length > 0 ? batches[0].id : undefined,
        difficulty: 'MEDIUM',
        totalMarks: 50,
        passingMarks: 20,
        maxAttempts: 3,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        published: true,
      });
      setSections([
        { title: 'Section 1: Core Concepts', description: 'Fundamental questions', sectionNumber: 1, questionIds: [] },
      ]);
      showNotification('Multi-section assignment created & published!');
      fetchAssignments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create assignment.');
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
              <FileCheck2 className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Assignments & Labs Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create multi-section assignments (Section 1, Section 2) with questions pulled from the Question Bank, deadlines, and cohort targeting.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchAssignments()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Assignments"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setStep(1);
                setShowWizard(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading assignments...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No assignments configured yet. Click "Create Assignment" to build a multi-section assignment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3">Assignment Title</th>
                  <th className="pb-3">Curriculum / Batch</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Marks & Pass</th>
                  <th className="pb-3">Sections & Questions</th>
                  <th className="pb-3">Timeline</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{a.title}</div>
                      <div className="text-[10px] font-normal text-slate-400 line-clamp-1">{a.description}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{a.batchName || 'All Cohorts'}</div>
                      <div className="text-[10px] text-slate-400">{a.courseTitle || 'Curriculum'}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        a.difficulty === 'EASY'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : a.difficulty === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {a.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono">
                      <div className="font-bold text-brand-600 dark:text-brand-400">{a.totalMarks} Marks</div>
                      <div className="text-[10px] text-slate-400">Pass: {a.passingMarks} Marks</div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300 font-semibold">
                      <div>{a.totalSections} Sections</div>
                      <div className="text-[10px] text-slate-400">{a.totalQuestions} Questions</div>
                    </td>
                    <td className="py-3.5 text-[10px] text-slate-400">
                      <div>Due: {a.dueDate || 'No Due Date'}</div>
                      <div>Attempts: {a.maxAttempts} Allowed</div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(a.id, a.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      {/* CREATE MULTI-SECTION ASSIGNMENT WIZARD MODAL */}
      {/* ========================================================= */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Create Multi-Section Assignment
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Step {step} of 2: {step === 1 ? 'Assignment Configuration & Rules' : 'Section & Question Bank Allocation'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWizard(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium shrink-0">
                {formError}
              </div>
            )}

            {/* Step 1: Assignment Properties */}
            {step === 1 && (
              <div className="space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Lab 03: Data Structures & Hash Tables"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Curriculum Track (Course)
                    </label>
                    <select
                      value={form.courseId || ''}
                      onChange={(e) => setForm({ ...form, courseId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Cohort (Batch)
                    </label>
                    <select
                      value={form.batchId || ''}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="">All Cohorts (Open)</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Instructions for students..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.totalMarks}
                      onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.passingMarks}
                      onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxAttempts}
                      onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Available From (Start Date)
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Submission Deadline (Due Date)
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-2 rounded-xl border font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.title.trim()) {
                        setFormError('Please enter assignment title.');
                        return;
                      }
                      setFormError(null);
                      setStep(2);
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                  >
                    Next: Add Sections & Questions &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Multi-Sections and Question Picker */}
            {step === 2 && (
              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Assignment Sections ({sections.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3 py-1.5 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 rounded-xl font-bold"
                    >
                      + Add Another Section
                    </button>
                  </div>

                  {sections.map((sec, secIdx) => (
                    <div key={secIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                            {secIdx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={sec.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[secIdx].title = e.target.value;
                              setSections(updated);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(secIdx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Question Selector for this Section */}
                      <div className="space-y-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                          Select Questions from Question Bank ({sec.questionIds.length} selected):
                        </span>

                        <div className="max-h-40 overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                          {questions.length === 0 ? (
                            <div className="p-4 text-center text-slate-400">Question bank is empty. Author questions first.</div>
                          ) : (
                            questions.map((q) => {
                              const isChecked = sec.questionIds.includes(q.id);
                              return (
                                <label key={q.id} className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleQuestionInSection(secIdx, q.id)}
                                      className="w-3.5 h-3.5 text-brand-600 rounded"
                                    />
                                    <span className="font-bold text-slate-900 dark:text-white">{q.title}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      q.questionType === 'CODING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    }`}>
                                      {q.questionType}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400">{q.marks} Marks</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border font-bold"
                  >
                    &larr; Back to Details
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Finalize & Publish Assignment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
