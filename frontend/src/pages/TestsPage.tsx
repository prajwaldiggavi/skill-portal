import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Clock,
  Award,
  AlertCircle,
  Play,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { TestSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const TestsPage: React.FC = () => {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests')
      .then((res) => setTests(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading assessments & examinations..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-[#00c2ff]" />
          Assessments & Timed Tests
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-authoritative timed examinations with algorithmic coding problems, MCQs, and automated grading.
        </p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((t) => {
          const isFinished = t.attemptStatus === 'EVALUATED' || t.attemptStatus === 'AUTO_SUBMITTED' || t.attemptStatus === 'SUBMITTED';
          const inProgress = t.attemptStatus === 'IN_PROGRESS';

          return (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] hover:border-[#283244] shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#181c26] text-sky-400 border border-[#263147]">
                    {t.durationMinutes} Minutes Timed
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Passing: {t.passingPercentage}%
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-white">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {t.description}
                </p>

                <div className="mt-4 p-3.5 rounded-xl bg-[#090b0e] border border-[#1a1f2c] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Maximum Marks</span>
                    <strong className="text-white">{t.totalMarks} Marks</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Attempt Status</span>
                    <strong
                      className={`font-bold ${
                        isFinished
                          ? 'text-emerald-400'
                          : inProgress
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {t.attemptStatus || 'Not Attempted'}
                    </strong>
                  </div>

                  {isFinished && t.score !== null && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#1f2430]">
                      <span className="text-slate-400">Final Score</span>
                      <strong className="text-[#00c2ff] font-extrabold">
                        {t.score} / {t.totalMarks} ({t.percentage}%)
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1a1f2c] flex items-center justify-end">
                {isFinished && t.attemptId ? (
                  <Link
                    to={`/tests/${t.id}/result/${t.attemptId}`}
                    className="px-4 py-2 rounded-xl bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>View Performance Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to={`/tests/${t.id}/workspace`}
                    className="px-4 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{inProgress ? 'Resume Test' : 'Start Assessment'}</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

