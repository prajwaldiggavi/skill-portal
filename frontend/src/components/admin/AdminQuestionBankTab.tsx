import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Code2,
  CheckSquare,
  Radio,
  Tag,
  BookOpen
} from 'lucide-react';
import api from '../../api/client';
import {
  QuestionBankItem,
  QuestionCreateRequest,
  QuestionOptionItem,
  TestCaseItem
} from '../../types';

export const AdminQuestionBankTab: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODING'>('MCQ_SINGLE');
  const [form, setForm] = useState({
    title: '',
    description: '',
    explanation: '',
    difficulty: 'MEDIUM',
    marks: 10,
    negativeMarks: 0,
    topicId: undefined as number | undefined,
    tags: '',
    active: true,
  });

  // MCQ Options
  const [options, setOptions] = useState<QuestionOptionItem[]>([
    { optionLabel: 'A', optionText: '', isCorrect: true },
    { optionLabel: 'B', optionText: '', isCorrect: false },
    { optionLabel: 'C', optionText: '', isCorrect: false },
    { optionLabel: 'D', optionText: '', isCorrect: false },
  ]);

  // Coding Specs
  const [codingForm, setCodingForm] = useState({
    problemStatement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    starterCodeJava: 'class Solution {\n    public int solve(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}',
    starterCodePython: 'def solve(nums):\n    # Your code here\n    pass',
    starterCodeJs: 'function solve(nums) {\n    // Your code here\n    return 0;\n}',
  });
  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { inputData: '5\n1 2 3 4 5', expectedOutput: '15', hidden: false },
    { inputData: '3\n10 20 30', expectedOutput: '60', hidden: true },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (difficultyFilter !== 'ALL') params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/questions', { params });
      setQuestions(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load questions', err);
      setError(err.response?.data?.message || 'Failed to load question bank.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [typeFilter, difficultyFilter]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteQuestion = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete question "${title}"?`)) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      showNotification('Question removed from question bank.');
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, { optionLabel: nextLabel, optionText: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert('A multiple choice question must have at least 2 options.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { inputData: '', expectedOutput: '', hidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) {
      alert('A coding problem must have at least 1 test case.');
      return;
    }
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Question title is required.');
      return;
    }

    if (formType === 'MCQ_SINGLE' || formType === 'MCQ_MULTI') {
      const emptyOpt = options.find((o) => !o.optionText.trim());
      if (emptyOpt) {
        setFormError(`Option ${emptyOpt.optionLabel} text cannot be empty.`);
        return;
      }
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setFormError('At least one option must be marked as correct.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: QuestionCreateRequest = {
        title: form.title.trim(),
        description: form.description.trim(),
        explanation: form.explanation.trim(),
        questionType: formType,
        difficulty: form.difficulty,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks),
        tags: form.tags.trim(),
        active: form.active,
        options: formType !== 'CODING' ? options : undefined,
        codingSpecs: formType === 'CODING' ? {
          problemStatement: codingForm.problemStatement || form.description,
          inputFormat: codingForm.inputFormat,
          outputFormat: codingForm.outputFormat,
          constraints: codingForm.constraints,
          starterCodeJava: codingForm.starterCodeJava,
          starterCodePython: codingForm.starterCodePython,
          starterCodeJs: codingForm.starterCodeJs,
          testCases: testCases,
        } : undefined,
      };

      await api.post('/admin/questions', payload);
      setShowAddModal(false);
      setForm({
        title: '',
        description: '',
        explanation: '',
        difficulty: 'MEDIUM',
        marks: 10,
        negativeMarks: 0,
        topicId: undefined,
        tags: '',
        active: true,
      });
      showNotification('New question authored and saved to Question Bank!');
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create question.');
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
              <FileQuestion className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Global Question Bank
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Author and organize reusable questions (Single Choice, Multi Choice, Coding Problems with Test Cases) for assignments and assessments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchQuestions()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Question Bank"
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
              <span>Author Question</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); fetchQuestions(); }} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by question title, tags..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="ALL">All Question Types</option>
              <option value="MCQ_SINGLE">Single Choice (Radio)</option>
              <option value="MCQ_MULTI">Multiple Choice (Checkboxes)</option>
              <option value="CODING">Coding Problem (Algorithmic)</option>
            </select>
          </div>

          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading question bank...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No questions found matching criteria.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {questions.map((q) => (
              <div key={q.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        q.questionType === 'CODING'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : q.questionType === 'MCQ_MULTI'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      }`}>
                        {q.questionType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {q.marks} Marks {q.negativeMarks > 0 ? `(-${q.negativeMarks})` : ''}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {q.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                      {q.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id, q.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options Preview for MCQs */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-xl text-[11px] border flex items-center gap-2 ${
                          opt.correct
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border flex items-center justify-center font-bold text-[10px] shrink-0">
                          {opt.optionLabel}
                        </span>
                        <span className="truncate">{opt.optionText}</span>
                        {opt.correct && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* AUTHOR QUESTION MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Author Question in Question Bank
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium shrink-0">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Type selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Format *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('MCQ_SINGLE')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      formType === 'MCQ_SINGLE'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Single Choice (Radio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('MCQ_MULTI')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      formType === 'MCQ_MULTI'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Multi Choice (MSQ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('CODING')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      formType === 'CODING'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Algorithmic Coding
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Reverse a Singly Linked List"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Description / Problem Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail the question context, problem requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Option Adder for MCQs */}
              {(formType === 'MCQ_SINGLE' || formType === 'MCQ_MULTI') && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Answer Choices & Correct Key
                    </span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-brand-600 rounded-lg text-[11px] font-bold"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {opt.optionLabel}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.optionText}
                          onChange={(e) => {
                            const updated = [...options];
                            updated[idx].optionText = e.target.value;
                            setOptions(updated);
                          }}
                          placeholder={`Option ${opt.optionLabel} text...`}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <input
                            type={formType === 'MCQ_SINGLE' ? 'radio' : 'checkbox'}
                            name="correctOption"
                            checked={opt.isCorrect}
                            onChange={(e) => {
                              const updated = options.map((o, i) => {
                                if (formType === 'MCQ_SINGLE') {
                                  return { ...o, isCorrect: i === idx };
                                } else {
                                  return i === idx ? { ...o, isCorrect: e.target.checked } : o;
                                }
                              });
                              setOptions(updated);
                            }}
                            className="w-4 h-4 text-brand-600"
                          />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Correct</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Coding Specs & Test Cases for Coding */}
              {formType === 'CODING' && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Coding Problem Specs & Starter Code
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Input Format</label>
                      <textarea
                        rows={2}
                        value={codingForm.inputFormat}
                        onChange={(e) => setCodingForm({ ...codingForm, inputFormat: e.target.value })}
                        placeholder="e.g. First line contains N integers"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Output Format</label>
                      <textarea
                        rows={2}
                        value={codingForm.outputFormat}
                        onChange={(e) => setCodingForm({ ...codingForm, outputFormat: e.target.value })}
                        placeholder="e.g. Print the maximum sum integer"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Starter Code (Java)</label>
                    <textarea
                      rows={3}
                      value={codingForm.starterCodeJava}
                      onChange={(e) => setCodingForm({ ...codingForm, starterCodeJava: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] outline-none"
                    />
                  </div>

                  {/* Test Cases Builder */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Test Cases (I/O)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-brand-600 rounded-lg text-[11px] font-bold"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    {testCases.map((tc, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>Test Case #{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tc.hidden}
                                onChange={(e) => {
                                  const updated = [...testCases];
                                  updated[idx].hidden = e.target.checked;
                                  setTestCases(updated);
                                }}
                                className="w-3.5 h-3.5 text-brand-600 rounded"
                              />
                              <span className="text-[10px] text-slate-500">Hidden (Evaluative)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(idx)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <textarea
                            rows={2}
                            required
                            value={tc.inputData}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].inputData = e.target.value;
                              setTestCases(updated);
                            }}
                            placeholder="Input data (stdin)..."
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border font-mono text-[11px] outline-none"
                          />
                          <textarea
                            rows={2}
                            required
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].expectedOutput = e.target.value;
                              setTestCases(updated);
                            }}
                            placeholder="Expected output (stdout)..."
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border font-mono text-[11px] outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Authoring...' : 'Save to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
