import React from 'react';
import {
  Users,
  GraduationCap,
  FolderTree,
  FileCheck2,
  FileSpreadsheet,
  FileQuestion,
  Code2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AdminOverview } from '../../types';

interface AdminOverviewTabProps {
  overview: AdminOverview;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  overview,
  onNavigateTab,
  onRefresh,
}) => {
  const recentStudents = overview.recentStudents || [];
  const recentSubmissions = overview.recentSubmissions || [];
  const upcomingTests = overview.upcomingTests || [];
  const upcomingAssignments = overview.upcomingAssignments || [];

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 hover:border-brand-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">
            {overview.totalStudents ?? 0}
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            {overview.activeStudents ?? 0} Active Learners
          </span>
        </div>

        {/* Batches */}
        <div
          onClick={() => onNavigateTab('batches')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Cohorts & Batches</span>
            <GraduationCap className="w-4 h-4 text-[#00c2ff] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {overview.totalBatches ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-[#00c2ff]">
            {overview.averageAttendance ? `${overview.averageAttendance}% Avg Att.` : 'Active Cohorts'}
          </span>
        </div>

        {/* Courses */}
        <div
          onClick={() => onNavigateTab('courses')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Curriculum Tracks</span>
            <FolderTree className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#38bdf8]">
            {overview.totalCourses ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Courses Configured</span>
        </div>

        {/* Assignments */}
        <div
          onClick={() => onNavigateTab('assignments')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Labs & Assignments</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {overview.totalAssignments ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">
            {overview.assignmentCompletionRate ? `${overview.assignmentCompletionRate}% Done` : 'Published Labs'}
          </span>
        </div>

        {/* Tests */}
        <div
          onClick={() => onNavigateTab('tests')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Exams & Assessments</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {overview.totalTests ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {overview.averageTestScore ? `${overview.averageTestScore}% Avg Marks` : 'Server-Timed'}
          </span>
        </div>

        {/* Question Bank */}
        <div
          onClick={() => onNavigateTab('questions')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Question Bank</span>
            <FileQuestion className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {overview.totalQuestions ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">MCQ / Coding Pool</span>
        </div>

        {/* Submissions */}
        <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Submissions Graded</span>
            <Code2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {overview.totalSubmissions ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Sandbox Runs</span>
        </div>

        {/* Attendance Sessions */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-1 hover:border-[#00c2ff]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Attendance Sessions</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {overview.totalAttendanceSessions ?? 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Class Registers</span>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00c2ff]" />
            <span>Administrative Quick Action Launchpad</span>
          </h3>
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
            title="Refresh Platform Metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <button
            onClick={() => onNavigateTab('students')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Enroll Student</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('batches')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Create Batch</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('assignments')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>New Assignment</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('tests')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Create Test Exam</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('questions')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Author Question</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Take Attendance</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('courses')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Curriculum Tree</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('announcements')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all text-left flex items-center justify-between"
          >
            <span>Broadcast Alert</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Two Column Section: Live Sandbox Stream on Left, Upcoming Deadlines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Submissions Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-600" />
              <span>Live Algorithmic Submissions Stream</span>
            </h3>
            <span className="text-[11px] text-slate-400">Real-time code judge logs</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {recentSubmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No submissions logged today.
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.submissionId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {sub.status === 'ACCEPTED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {sub.studentName} solved <span className="text-brand-600 dark:text-brand-400">{sub.questionTitle}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">
                        Language: {sub.language} • {sub.runtimeMs} ms
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Upcoming Deadlines & Schedule</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Exams Window Closing Soon
              </span>
              {upcomingTests.length === 0 ? (
                <div className="py-3 text-slate-400 text-[11px]">No test deadlines this week.</div>
              ) : (
                <div className="mt-1.5 space-y-2">
                  {upcomingTests.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                      <div className="text-[10px] text-brand-600 font-mono">Cohort: {t.targetBatch}</div>
                      <div className="text-[10px] text-slate-400">Ends: {t.deadline}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assignment Deadlines
              </span>
              {upcomingAssignments.length === 0 ? (
                <div className="py-3 text-slate-400 text-[11px]">No lab deadlines this week.</div>
              ) : (
                <div className="mt-1.5 space-y-2">
                  {upcomingAssignments.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Cohort: {a.targetBatch}</div>
                      <div className="text-[10px] text-slate-400">Due: {a.deadline}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
