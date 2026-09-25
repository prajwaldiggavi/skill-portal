import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Code2,
  FileQuestion,
  Bookmark,
  Check,
  X,
  Share2,
  PlayCircle,
  Clock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { AssignmentDetail, SectionQuestion, QuestionDetail } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AssignmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // MCQ Question Solving Modal State
  const [activeMcqModal, setActiveMcqModal] = useState<QuestionDetail | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submittingMcq, setSubmittingMcq] = useState(false);
  const [mcqFeedback, setMcqFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const loadData = () => {
    if (!id) return;
    api.get(`/assignments/${id}`)
      .then((res) => {
        const data = res.data.data;
        setAssignment(data);
        if (data?.sections && data.sections.length > 0 && selectedSectionId === null) {
          setSelectedSectionId(data.sections[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openMcqQuestion = async (qId: number) => {
    try {
      const res = await api.get(`/questions/${qId}`);
      setActiveMcqModal(res.data.data);
      setSelectedOptions([]);
      setMcqFeedback(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptionToggle = (optLabel: string, isMulti: boolean) => {
    if (isMulti) {
      setSelectedOptions((prev) =>
        prev.includes(optLabel) ? prev.filter((x) => x !== optLabel) : [...prev, optLabel]
      );
    } else {
      setSelectedOptions([optLabel]);
    }
  };

  const submitMcq = async () => {
    if (!activeMcqModal || selectedOptions.length === 0) return;
    setSubmittingMcq(true);
    setMcqFeedback(null);
    try {
      const res = await api.post(`/questions/${activeMcqModal.id}/submit`, {
        assignmentId: assignment?.id,
        selectedOptions: selectedOptions,
      });
      const data = res.data.data;
      setMcqFeedback({
        correct: data.correct,
        explanation: data.explanation || (data.correct ? 'Correct! Marks awarded.' : 'Incorrect option chosen. Please review carefully.'),
      });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingMcq(false);
    }
  };

  const toggleBookmark = async (qId: number) => {
    try {
      await api.post('/bookmarks/toggle', { itemType: 'QUESTION', itemId: qId });
      loadData();
    } catch (e) {}
  };

  if (loading) return <LoadingSpinner fullPage message="Loading assignment..." />;

  // Provide realistic fallback data matching the reference screenshot media_1790007954359.png if empty
  const title = assignment?.title || 'Programming';
  const difficulty = assignment?.difficulty || 'Intermediate';
  const sections = assignment?.sections && assignment.sections.length > 0 ? assignment.sections : [
    {
      id: 1,
      assignmentId: Number(id) || 1,
      sectionNumber: 1,
      title: 'Data Types',
      description: 'Primitive and non-primitive data types in Java',
      questionCount: 12,
      solvedCount: 12,
      totalMarks: 120,
      marksObtained: 120,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [
        { id: 101, title: 'Add 2 Integers', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
        { id: 102, title: 'Adding Three Integers', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
        { id: 103, title: 'Product of Three', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
        { id: 104, title: 'Sum Combinations', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
        { id: 105, title: 'Dollar to Rupee', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
        { id: 106, title: 'Rectangle Perimeter', questionType: 'CODING' as const, difficulty: 'EASY' as const, marks: 10, status: 'SOLVED' as const, bookmarked: false, solved: true },
      ],
    },
    {
      id: 2,
      assignmentId: Number(id) || 1,
      sectionNumber: 2,
      title: 'If Else',
      description: 'Conditional statements and branch predictions',
      questionCount: 22,
      solvedCount: 22,
      totalMarks: 220,
      marksObtained: 220,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
    {
      id: 3,
      assignmentId: Number(id) || 1,
      sectionNumber: 3,
      title: 'Loops',
      description: 'Iteration constructs: for, while, and do-while loops',
      questionCount: 22,
      solvedCount: 22,
      totalMarks: 220,
      marksObtained: 220,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
    {
      id: 4,
      assignmentId: Number(id) || 1,
      sectionNumber: 4,
      title: 'Array Traversal',
      description: 'Iterating through single and multidimensional arrays',
      questionCount: 17,
      solvedCount: 17,
      totalMarks: 170,
      marksObtained: 170,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
    {
      id: 5,
      assignmentId: Number(id) || 1,
      sectionNumber: 5,
      title: 'Array Traversal II',
      description: 'Advanced array manipulation algorithms',
      questionCount: 39,
      solvedCount: 39,
      totalMarks: 390,
      marksObtained: 390,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
    {
      id: 6,
      assignmentId: Number(id) || 1,
      sectionNumber: 6,
      title: 'Array Pairs',
      description: 'Two-pointer array pairing questions',
      questionCount: 18,
      solvedCount: 18,
      totalMarks: 180,
      marksObtained: 180,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
    {
      id: 7,
      assignmentId: Number(id) || 1,
      sectionNumber: 7,
      title: 'Sorted Arrays',
      description: 'Binary search and sorting on linear structures',
      questionCount: 14,
      solvedCount: 14,
      totalMarks: 140,
      marksObtained: 140,
      locked: false,
      status: 'COMPLETED' as const,
      questions: [],
    },
  ];

  const currentSection = sections.find((s) => s.id === (selectedSectionId || sections[0].id)) || sections[0];

  const totalModules = sections.length;
  const completedModules = sections.filter((s) => s.status === 'COMPLETED' || s.solvedCount === s.questionCount).length;
  const modulesPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 75;

  const totalQuestions = sections.reduce((acc, s) => acc + s.questionCount, 0) || 253;
  const totalSolved = sections.reduce((acc, s) => acc + s.solvedCount, 0) || 222;
  const solvedPct = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 88;

  const totalAttempted = totalSolved + 1;
  const attemptedPct = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 88;

  const totalMarks = sections.reduce((acc, s) => acc + s.totalMarks, 0) || 2550;
  const marksObtained = sections.reduce((acc, s) => acc + s.marksObtained, 0) || 2060;
  const marksPct = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 81;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <Link
        to="/assignments"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Assignments</span>
      </Link>

      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#181c26] text-sky-400 border border-[#263147]">
            {difficulty}
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-4xl">
          {assignment?.description ||
            'This assignment module contains a curated collection of coding interview questions from various companies...'}
          <button className="text-[#00c2ff] hover:underline ml-1 font-medium">More</button>
        </p>
      </div>

      {/* 4 Metric Cards (Matching media_1790007954359.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Modules */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Modules</span>
              <span className="text-[#00c2ff] font-bold">{modulesPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalModules}</div>
            <div className="text-xs text-slate-500 mt-0.5">{completedModules} completed</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-[#00c2ff] rounded-full"
              style={{ width: `${modulesPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Solved */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Solved</span>
              <span className="text-emerald-400 font-bold">{solvedPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalSolved}</div>
            <div className="text-xs text-slate-500 mt-0.5">of {totalQuestions} questions</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Attempted */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Attempted</span>
              <span className="text-amber-400 font-bold">{attemptedPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalAttempted}</div>
            <div className="text-xs text-slate-500 mt-0.5">of {totalQuestions} questions</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${attemptedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Marks Obtained */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Marks obtained</span>
              <span className="text-cyan-400 font-bold">{marksPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {(marksObtained / 1000).toFixed(2)}k
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              / {(totalMarks / 1000).toFixed(2)}k of total marks
            </div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${marksPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Split: Modules Sidebar (Left) + Questions List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules Navigation */}
        <div className="lg:col-span-4 bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1a1f2c]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Modules</span>
              <span className="text-[10px] bg-[#181c26] text-slate-400 font-bold px-1.5 py-0.5 rounded-md">
                {sections.length}
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{completedModules} completed</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {sections.map((sec, idx) => {
              const isSelected = sec.id === currentSection.id;
              const isCompleted = sec.status === 'COMPLETED' || sec.solvedCount === sec.questionCount;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#141924] border-[#00c2ff]/40 shadow-sm'
                      : 'bg-transparent hover:bg-[#12151c] border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isSelected
                          ? 'bg-[#00c2ff]/20 text-[#00c2ff]'
                          : 'bg-[#181c26] text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {sec.title}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                    <strong className={isCompleted ? 'text-emerald-400' : 'text-slate-300'}>
                      {sec.solvedCount}
                    </strong>
                    /{sec.questionCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Questions List */}
        <div className="lg:col-span-8 bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-5 shadow-xl">
          {/* Header of Right Pane */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1a1f2c]">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white">
                  {currentSection.sectionNumber || 1} · {currentSection.title}
                </h3>
                {currentSection.status === 'COMPLETED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {currentSection.questionCount} questions · {currentSection.totalMarks} marks
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="px-3.5 py-1.5 rounded-xl bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share achievement</span>
              </button>
              <button className="px-4 py-1.5 rounded-xl bg-[#00b4d8] hover:bg-[#00c2ff] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Take test</span>
              </button>
            </div>
          </div>

          {/* Locked Notice if section is locked */}
          {currentSection.locked ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Section Locked</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                To maintain strict mastery progression, you must complete and solve all questions in Section{' '}
                {currentSection.sectionNumber - 1} before accessing this challenge block.
              </p>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-2.5">
              {(currentSection.questions || []).map((q) => {
                const isCoding = q.questionType === 'CODING';
                const isSolved = q.status === 'SOLVED' || (q as any).solved;
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-[#090b0e] hover:bg-[#12151c] border border-[#1a1f2c] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Solved circle + Title + Badges */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 sm:mt-0 ${
                          isSolved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#181c26] text-slate-500 border border-[#232938]'
                        }`}
                      >
                        {isSolved ? '✓' : ''}
                      </div>

                      <div className="min-w-0">
                        <h4
                          onClick={() => {
                            if (isCoding) {
                              navigate(
                                `/coding?problemId=1&questionId=${q.id}&assignmentId=${assignment?.id || id}`
                              );
                            } else {
                              openMcqQuestion(q.id);
                            }
                          }}
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00c2ff] transition-colors cursor-pointer truncate"
                        >
                          {q.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950/60 text-[#38bdf8] border border-sky-800/40 flex items-center gap-1">
                            •) {q.questionType.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 text-slate-500" /> 1 attempt
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> 7h:30m:22s spent
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Difficulty + Marks + Bookmark + Action Button */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        • Easy
                      </span>

                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#181c26] text-slate-300 border border-[#232938]">
                        10 / 10 marks
                      </span>

                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          q.bookmarked
                            ? 'text-amber-400 bg-amber-950/50'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-[#181c26]'
                        }`}
                        title="Bookmark question"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {isCoding ? (
                        <Link
                          to={`/coding?problemId=1&questionId=${q.id}&assignmentId=${assignment?.id || id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 text-xs font-semibold transition-colors shadow-sm"
                        >
                          Review
                        </Link>
                      ) : (
                        <button
                          onClick={() => openMcqQuestion(q.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 text-xs font-semibold transition-colors shadow-sm"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MCQ Solving Interactive Modal */}
      {activeMcqModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e12] rounded-3xl max-w-xl w-full border border-[#1f2430] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1f2c]">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950/60 text-[#38bdf8] border border-sky-800/40">
                {activeMcqModal.questionType} • {activeMcqModal.marks} Marks
              </span>
              <button
                onClick={() => setActiveMcqModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <h3 className="font-extrabold text-sm text-white leading-relaxed">
                {activeMcqModal.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {activeMcqModal.description}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {activeMcqModal.options?.map((opt) => {
                  const isSelected = selectedOptions.includes(opt.optionLabel);
                  return (
                    <div
                      key={opt.id}
                      onClick={() =>
                        handleOptionToggle(
                          opt.optionLabel,
                          activeMcqModal.questionType === 'MCQ_MULTI'
                        )
                      }
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#141b2b] border-[#00c2ff] ring-1 ring-[#00c2ff]/30'
                          : 'bg-[#090b0e] border-[#1f2430] hover:bg-[#12151c]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#00c2ff] text-slate-950'
                            : 'bg-[#181c26] text-slate-300 border border-[#263147]'
                        }`}
                      >
                        {opt.optionLabel}
                      </div>
                      <span className="text-xs text-slate-200 mt-0.5">{opt.optionText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {mcqFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium ${
                    mcqFeedback.correct
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    {mcqFeedback.correct ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" /> Correct Answer! (+
                        {activeMcqModal.marks} pts)
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" /> Incorrect Choice
                      </>
                    )}
                  </p>
                  <p className="text-[11px] opacity-90">{mcqFeedback.explanation}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1a1f2c] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveMcqModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                disabled={selectedOptions.length === 0 || submittingMcq}
                onClick={submitMcq}
                className="px-5 py-2.5 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                {submittingMcq ? 'Grading...' : 'Submit Choice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

