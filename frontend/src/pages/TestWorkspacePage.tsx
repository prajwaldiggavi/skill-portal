import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Code2,
  FileQuestion,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { TestSession } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const TestWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [savedAnswers, setSavedAnswers] = useState<Record<number, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Flatten all questions across test sections
  const allQuestions = session?.sections.flatMap((s) => s.questions) || [];
  const currentQuestion = allQuestions[selectedQuestionIndex];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.post(`/tests/${id}/start`)
      .then((res) => {
        const sess = res.data.data;
        setSession(sess);
        setRemainingSec(sess.remainingSeconds || 1800);

        // Populate initial saved answers
        const map: Record<number, string> = {};
        sess.sections.forEach((s: any) => {
          s.questions.forEach((q: any) => {
            if (q.savedAnswer) {
              map[q.questionId] = q.savedAnswer;
            }
          });
        });
        setSavedAnswers(map);
      })
      .catch((err) => {
        console.error('Failed to start test session', err);
        navigate('/tests');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Live Timer Countdown
  useEffect(() => {
    if (remainingSec <= 0) return;

    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // Auto submit on expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSec]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Save answer to backend
  const persistAnswer = async (qId: number, answerVal: string, isCode = false) => {
    if (!session) return;
    setAutoSaveStatus('Saving draft...');
    try {
      await api.post(`/tests/${session.testId}/answers`, {
        attemptId: session.attemptId,
        questionId: qId,
        selectedOption: !isCode ? answerVal : null,
        codeAnswer: isCode ? answerVal : null,
      });
      setAutoSaveStatus('Saved ✓');
    } catch (e) {
      setAutoSaveStatus('Autosave error');
    }
  };

  const handleSelectOption = (optLabel: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...savedAnswers, [currentQuestion.questionId]: optLabel };
    setSavedAnswers(newAnswers);
    persistAnswer(currentQuestion.questionId, optLabel, false);
  };

  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...savedAnswers, [currentQuestion.questionId]: newCode };
    setSavedAnswers(newAnswers);
    persistAnswer(currentQuestion.questionId, newCode, true);
  };

  const handleFinalSubmit = async (auto = false) => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tests/${session.testId}/submit`, {
        attemptId: session.attemptId,
      });
      navigate(`/tests/${session.testId}/result/${session.attemptId}`);
    } catch (err) {
      console.error('Test submit failed', err);
      navigate(`/tests/${session.testId}/result/${session.attemptId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Securing and loading examination environment..." />;
  if (!session || !currentQuestion) return <div className="p-8 text-center text-sm">No test session available.</div>;

  const isLowTime = remainingSec < 300; // less than 5 mins

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Top Authoritative Timer Bar */}
      <div className="p-4 rounded-3xl bg-[#0c0e12] border border-[#1f2430] shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-sm">
            TEST
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white truncate max-w-md">
              {session.testTitle}
            </h1>
            <p className="text-[11px] text-slate-400">
              Draft Status: <strong className="text-cyan-400">{autoSaveStatus}</strong>
            </p>
          </div>
        </div>

        {/* Live Timer Gauge */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-black text-sm transition-colors ${
              isLowTime
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                : 'bg-[#181c26] text-white border border-[#263147]'
            }`}
          >
            <Clock className="w-4 h-4 text-current" />
            <span>{formatTime(remainingSec)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Test</span>
          </button>
        </div>
      </div>

      {/* Main Examination Workspace: Left Question Palette & Right Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Palette (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-4">
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Question Palette
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {allQuestions.map((q, idx) => {
              const isAnswered = !!savedAnswers[q.questionId];
              const isCurrent = idx === selectedQuestionIndex;

              return (
                <button
                  key={q.questionId}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md ring-2 ring-cyan-500/30'
                      : isAnswered
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#181c26] text-slate-400 border-[#263147] hover:border-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#1a1f2c] space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-300">Answered ({Object.keys(savedAnswers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#181c26] border border-[#263147]" />
              <span className="text-slate-400">Unanswered ({allQuestions.length - Object.keys(savedAnswers).length})</span>
            </div>
          </div>
        </div>

        {/* Right Active Question (9 cols) */}
        <div className="lg:col-span-9 p-6 rounded-3xl bg-[#0c0e12] border border-[#1f2430] shadow-xl flex flex-col justify-between space-y-6 min-h-[500px]">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1f2c]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Question {selectedQuestionIndex + 1} of {allQuestions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentQuestion.questionType.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs font-extrabold text-cyan-400">
                +{currentQuestion.marks} Marks
              </span>
            </div>

            {/* Question Body */}
            <div className="py-4 space-y-3">
              <h2 className="text-base font-extrabold text-white">
                {currentQuestion.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {currentQuestion.description}
              </p>
            </div>

            {/* Question Input Area: MCQ vs Coding */}
            {currentQuestion.questionType.startsWith('MCQ') ? (
              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((opt) => {
                  const isSelected = savedAnswers[currentQuestion.questionId] === opt.label;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => handleSelectOption(opt.label)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20'
                          : 'bg-[#12151c] border-[#1f2430] hover:bg-[#181c26]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-600 text-white'
                            : 'bg-[#181c26] text-slate-300 border border-[#263147]'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-200">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Coding Editor in Test */
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Enter your Java/Python code solution below:</span>
                </div>
                <div className="h-72 rounded-2xl overflow-hidden border border-[#1f2430]">
                  <Editor
                    height="100%"
                    language="java"
                    theme="vs-dark"
                    value={savedAnswers[currentQuestion.questionId] || '// Write your algorithmic solution here\n'}
                    onChange={(val) => handleCodeChange(val || '')}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#1a1f2c] flex items-center justify-between">
            <button
              disabled={selectedQuestionIndex === 0}
              onClick={() => setSelectedQuestionIndex(selectedQuestionIndex - 1)}
              className="px-4 py-2 rounded-xl bg-[#181c26] border border-[#263147] text-xs font-bold text-slate-300 hover:bg-[#202634] transition-all flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              disabled={selectedQuestionIndex === allQuestions.length - 1}
              onClick={() => setSelectedQuestionIndex(selectedQuestionIndex + 1)}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-all flex items-center gap-1 disabled:opacity-40 shadow-md shadow-cyan-600/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e12] rounded-3xl max-w-md w-full border border-[#1f2430] shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-white">
              Ready to Finalize and Submit?
            </h3>
            <p className="text-xs text-slate-400">
              You have answered {Object.keys(savedAnswers).length} of {allQuestions.length} questions. Once submitted, your answers will be evaluated server-side and recorded.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-[#181c26] border border-[#263147] transition-colors"
              >
                Return to Test
              </button>
              <button
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
              >
                {submitting ? 'Grading Answers...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
