import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import api from '../../api/client';
import {
  TestAdminItem,
  TestCreateRequest,
  CourseItem,
  BatchItem,
  QuestionBankItem
} from '../../types';

interface AdminTestsTabProps {
  courses: CourseItem[];
  batches: BatchItem[];
}

export const AdminTestsTab: React.FC<AdminTestsTabProps> = ({ courses, batches }) => {
  const [tests, setTests] = useState<TestAdminItem[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Test Modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: courses.length > 0 ? courses[0].id : undefined as number | undefined,
    batchId: batches.length > 0 ? batches[0].id : undefined as number | undefined,
    durationMinutes: 45,
    totalMarks: 100,
    passingPercentage: 40,
    negativeMarks: 0,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    attemptLimit: 1,
    published: true,
  });

  const [sections, setSections] = useState<Array<{
    title: string;
    orderIndex: number;
    questionIds: number[];
  }>>([
    { title: 'Section 1: General Assessment', orderIndex: 1, questionIds: [] },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [testRes, qRes] = await Promise.all([
        api.get('/admin/tests'),
        api.get('/admin/questions')
      ]);
      setTests(testRes.data?.data || []);
      setQuestions(qRes.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load tests', err);
      setError(err.response?.data?.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleTogglePublish = async (test: TestAdminItem) => {
    const newPub = !test.published;
    try {
      await api.patch(`/admin/tests/${test.id}/publish`, { isPublished: newPub });
      setTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, published: newPub } : t))
      );
      showNotification(`Test "${test.title}" publish status updated.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update test publish status.');
    }
  };

  const handleDeleteTest = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete test "${title}"?`)) return;
    try {
      await api.delete(`/admin/tests/${id}`);
      showNotification('Assessment deleted successfully.');
      fetchTests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete test.');
    }
  };

  const handleAddSection = () => {
    const num = sections.length + 1;
    setSections([...sections, { title: `Section ${num}: Advanced Topics`, orderIndex: num, questionIds: [] }]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      alert('A test must have at least one section.');
      return;
    }
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleToggleQuestionInSection = (secIdx: number, qId: number) => {
    const updated = [...sections];
    const cur = updated[secIdx].questionIds;
    if (cur.includes(qId)) {
      updated[secIdx].questionIds = cur.filter((id) => id !== qId);
    } else {
      updated[secIdx].questionIds = [...cur, qId];
    }
    setSections(updated);
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Test title is required.');
      return;
    }

    const hasQ = sections.some((s) => s.questionIds.length > 0);
    if (!hasQ) {
      setFormError('Please select at least one question from the Question Bank across sections.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: TestCreateRequest = {
        title: form.title.trim(),
        description: form.description.trim(),
        courseId: form.courseId,
        batchId: form.batchId,
        durationMinutes: Number(form.durationMinutes),
        totalMarks: Number(form.totalMarks),
        passingPercentage: Number(form.passingPercentage),
        negativeMarks: Number(form.negativeMarks),
        startTime: form.startTime,
        endTime: form.endTime,
        attemptLimit: Number(form.attemptLimit),
        published: form.published,
        sections: sections.map((s, idx) => ({
          title: s.title.trim(),
          orderIndex: idx + 1,
          questionIds: s.questionIds,
        })),
      };

      await api.post('/admin/tests', payload);
      setShowModal(false);
      setStep(1);
      setForm({
        title: '',
        description: '',
        courseId: courses.length > 0 ? courses[0].id : undefined,
        batchId: batches.length > 0 ? batches[0].id : undefined,
        durationMinutes: 45,
        totalMarks: 100,
        passingPercentage: 40,
        negativeMarks: 0,
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
        attemptLimit: 1,
        published: true,
      });
      setSections([
        { title: 'Section 1: General Assessment', orderIndex: 1, questionIds: [] },
      ]);
      showNotification('New assessment examination created successfully!');
      fetchTests();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create test.');
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
              <FileSpreadsheet className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Server-Authoritative Assessments & Exams
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create timed exams with server-synchronized timers, negative marking penalties, and auto-evaluated grading.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchTests()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Tests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setStep(1);
                setShowModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading assessments...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
        ) : tests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No exams configured yet. Click "Create Assessment" to set up your first exam.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3">Assessment Title</th>
                  <th className="pb-3">Target Batch / Track</th>
                  <th className="pb-3">Duration & Marks</th>
                  <th className="pb-3">Passing %</th>
                  <th className="pb-3">Questions & Attempts</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{t.title}</div>
                      <div className="text-[10px] font-normal text-slate-400 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{t.batchName || 'All Batches'}</div>
                      <div className="text-[10px] text-slate-400">{t.courseTitle || 'Curriculum'}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{t.durationMinutes} Minutes</div>
                      <div className="text-[10px] font-mono text-brand-600 dark:text-brand-400">{t.totalMarks} Total Marks</div>
                    </td>
                    <td className="py-3.5 font-black text-emerald-600">
                      {t.passingPercentage}%
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      <div>{t.totalQuestions} Questions</div>
                      <div className="text-[10px] text-slate-400">{t.studentAttempts} Submissions ({t.averageScore}% avg)</div>
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleTogglePublish(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          t.published
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Click to toggle publish"
                      >
                        {t.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTest(t.id, t.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Assessment"
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
      {/* CREATE TEST WIZARD MODAL */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Create Examination Assessment
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Step {step} of 2: {step === 1 ? 'Exam Setup & Timers' : 'Select Exam Questions from Question Bank'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium shrink-0">
                {formError}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Midterm Evaluation: Java & Algorithmic Problem Solving"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold focus:ring-2 focus:ring-brand-500"
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
                      Target Cohort (Batch)
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

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Min) *
                    </label>
                    <input
                      type="number"
                      min={5}
                      value={form.durationMinutes}
                      onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    />
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Passing %
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.passingPercentage}
                      onChange={(e) => setForm({ ...form, passingPercentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Attempt Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.attemptLimit}
                      onChange={(e) => setForm({ ...form, attemptLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Time (Window Open)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Time (Window Close)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.title.trim()) {
                        setFormError('Please enter assessment title.');
                        return;
                      }
                      setFormError(null);
                      setStep(2);
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                  >
                    Next: Add Questions &rarr;
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleCreateTest} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Exam Sections ({sections.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3 py-1.5 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 rounded-xl font-bold"
                    >
                      + Add Section
                    </button>
                  </div>

                  {sections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                            {sIdx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={sec.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sIdx].title = e.target.value;
                              setSections(updated);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                          />
                        </div>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sIdx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                          Select Exam Questions from Question Bank ({sec.questionIds.length} selected):
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
                                      onChange={() => handleToggleQuestionInSection(sIdx, q.id)}
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
                    {submitting ? 'Creating...' : 'Finalize & Publish Assessment'}
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
