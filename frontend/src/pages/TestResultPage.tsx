import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { TestResult } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const TestResultPage: React.FC = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !attemptId) return;
    setLoading(true);
    api.get(`/tests/${id}/attempts/${attemptId}/result`)
      .then((res) => setResult(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, attemptId]);

  if (loading) return <LoadingSpinner fullPage message="Compiling official scorecard & explanations..." />;
  if (!result) return <div className="p-8 text-center text-sm">Scorecard not available.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/tests"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Assessments</span>
      </Link>

      {/* Scorecard Hero Banner */}
      <div
        className={`p-8 rounded-3xl text-center shadow-xl border ${
          result.passed
            ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-brand-500/10 border-emerald-500/30'
            : 'bg-gradient-to-br from-slate-100 to-sky-50/50 dark:from-slate-900 dark:to-slate-800/80 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg ${
            result.passed
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-brand-600 text-white shadow-brand-600/30'
          }`}
        >
          {result.passed ? <Trophy className="w-8 h-8" /> : <FileCheck className="w-8 h-8" />}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            result.passed
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {result.passed ? 'Assessment Passed 🎉' : 'Assessment Completed'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
          {result.testTitle}
        </h1>

        <div className="flex items-center justify-center gap-8 mt-6">
          <div>
            <span className="text-xs text-slate-400 font-medium">Marks Awarded</span>
            <div className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">
              {result.totalScore} / {result.maxScore}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 font-medium">Percentage</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {result.percentage}%
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 font-medium">Evaluation Status</span>
            <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-1">
              {result.status}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Performance & Detailed Answer Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review your responses against the official solution keys and deep technical explanations.
          </p>
        </div>

        <div className="space-y-4">
          {result.reviewItems.map((item, idx) => (
            <div
              key={item.questionId || idx}
              className={`p-5 rounded-2xl border transition-all ${
                item.isCorrect
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                  : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Q{idx + 1}. {item.questionTitle}
                  </h3>
                </div>

                <span className="text-xs font-black shrink-0 text-slate-700 dark:text-slate-300">
                  {item.marksAwarded} / {item.maxMarks} pts
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Your Response:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.selectedAnswer}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Correct Answer:
                  </span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.correctAnswer}
                  </p>
                </div>
              </div>

              {item.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Explanation: </strong>
                  {item.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
