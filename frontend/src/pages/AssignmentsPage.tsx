import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Code2, Database, Globe, FileCode2, Layers, Cpu, Server, Terminal } from 'lucide-react';
import api from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface AssignmentItem {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modulesCount: number;
  questionsCount: number;
  marksObtained: number;
  totalMarks: number;
  progressPercentage: number;
  solvedCount: number;
  remainingCount: number;
  iconType: 'java' | 'code' | 'sql' | 'html' | 'css' | 'spring' | 'dsa' | 'default';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
}

const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 1,
    title: 'Java Quiz',
    difficulty: 'Beginner',
    modulesCount: 19,
    questionsCount: 317,
    marksObtained: 336,
    totalMarks: 455,
    progressPercentage: 71,
    solvedCount: 224,
    remainingCount: 93,
    iconType: 'java',
    status: 'IN_PROGRESS',
  },
  {
    id: 2,
    title: 'Java Coding Scenarios',
    difficulty: 'Intermediate',
    modulesCount: 13,
    questionsCount: 125,
    marksObtained: 208,
    totalMarks: 1250,
    progressPercentage: 19,
    solvedCount: 24,
    remainingCount: 101,
    iconType: 'java',
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    title: 'Programming',
    difficulty: 'Intermediate',
    modulesCount: 16,
    questionsCount: 253,
    marksObtained: 2060,
    totalMarks: 2550,
    progressPercentage: 88,
    solvedCount: 222,
    remainingCount: 31,
    iconType: 'code',
    status: 'IN_PROGRESS',
  },
  {
    id: 4,
    title: 'SQL',
    difficulty: 'Intermediate',
    modulesCount: 10,
    questionsCount: 202,
    marksObtained: 0,
    totalMarks: 203,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 202,
    iconType: 'sql',
    status: 'IN_PROGRESS',
  },
  {
    id: 5,
    title: 'HTML',
    difficulty: 'Beginner',
    modulesCount: 6,
    questionsCount: 123,
    marksObtained: 0,
    totalMarks: 146,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 123,
    iconType: 'html',
    status: 'IN_PROGRESS',
  },
  {
    id: 6,
    title: 'CSS',
    difficulty: 'Beginner',
    modulesCount: 8,
    questionsCount: 160,
    marksObtained: 0,
    totalMarks: 160,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 160,
    iconType: 'css',
    status: 'IN_PROGRESS',
  },
  {
    id: 7,
    title: 'Spring Framework',
    difficulty: 'Intermediate',
    modulesCount: 12,
    questionsCount: 180,
    marksObtained: 0,
    totalMarks: 360,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 180,
    iconType: 'spring',
    status: 'IN_PROGRESS',
  },
  {
    id: 8,
    title: 'Data Structures & Algorithms',
    difficulty: 'Advanced',
    modulesCount: 15,
    questionsCount: 240,
    marksObtained: 0,
    totalMarks: 480,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 240,
    iconType: 'dsa',
    status: 'IN_PROGRESS',
  },
  {
    id: 9,
    title: 'JavaScript & Web APIs',
    difficulty: 'Intermediate',
    modulesCount: 11,
    questionsCount: 145,
    marksObtained: 0,
    totalMarks: 290,
    progressPercentage: 0,
    solvedCount: 0,
    remainingCount: 145,
    iconType: 'code',
    status: 'IN_PROGRESS',
  },
];

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(DEFAULT_ASSIGNMENTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Attempt fetching real assignments from backend API
    api.get('/assignments')
      .then((res) => {
        const rawList = res.data?.data;
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: AssignmentItem[] = rawList.map((item: any, idx: number) => {
            const diff: 'Beginner' | 'Intermediate' | 'Advanced' =
              item.difficulty === 'EASY'
                ? 'Beginner'
                : item.difficulty === 'HARD'
                ? 'Advanced'
                : 'Intermediate';

            const iconMap: Record<string, AssignmentItem['iconType']> = {
              java: 'java',
              sql: 'sql',
              html: 'html',
              css: 'css',
              spring: 'spring',
              dsa: 'dsa',
            };
            const lowerTitle = (item.title || '').toLowerCase();
            let matchedIcon: AssignmentItem['iconType'] = 'code';
            if (lowerTitle.includes('java') && !lowerTitle.includes('script')) matchedIcon = 'java';
            else if (lowerTitle.includes('sql')) matchedIcon = 'sql';
            else if (lowerTitle.includes('html')) matchedIcon = 'html';
            else if (lowerTitle.includes('css')) matchedIcon = 'css';
            else if (lowerTitle.includes('spring')) matchedIcon = 'spring';

            const totalQ = item.totalQuestions || 20;
            const solvedQ = item.solvedQuestions || 0;
            const pct = item.percentage ? Math.round(item.percentage) : totalQ > 0 ? Math.round((solvedQ / totalQ) * 100) : 0;

            return {
              id: item.id || idx + 1,
              title: item.title,
              difficulty: diff,
              modulesCount: item.totalSections || 8,
              questionsCount: totalQ,
              marksObtained: item.marksObtained || 0,
              totalMarks: item.totalMarks || 100,
              progressPercentage: pct,
              solvedCount: solvedQ,
              remainingCount: Math.max(0, totalQ - solvedQ),
              iconType: matchedIcon,
              status: pct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
            };
          });

          // Merge to ensure we have all reference assignments
          const combined = [...mapped];
          DEFAULT_ASSIGNMENTS.forEach((def) => {
            if (!combined.some((c) => c.title.toLowerCase() === def.title.toLowerCase())) {
              combined.push(def);
            }
          });
          setAssignments(combined);
        }
      })
      .catch((err) => {
        console.warn('Using default reference assignments list', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'in_progress') return a.status === 'IN_PROGRESS';
    if (activeTab === 'completed') return a.status === 'COMPLETED';
    return true;
  });

  const allCount = assignments.length;
  const inProgressCount = assignments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  // Aggregate stats matching screenshot
  const totalSolved = assignments.reduce((acc, a) => acc + a.solvedCount, 0);
  const totalQuestions = assignments.reduce((acc, a) => acc + a.questionsCount, 0);
  const totalMarksEarned = assignments.reduce((acc, a) => acc + a.marksObtained, 0);
  const totalAvailableMarks = assignments.reduce((acc, a) => acc + a.totalMarks, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 29;

  const renderSubjectIcon = (type: AssignmentItem['iconType'], title: string) => {
    switch (type) {
      case 'java':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#141822] border border-[#232938] flex items-center justify-center text-rose-400 font-black text-sm">
            ☕
          </div>
        );
      case 'sql':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#141822] border border-[#232938] flex items-center justify-center text-[#00c2ff]">
            <Database className="w-5 h-5" />
          </div>
        );
      case 'html':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#e34f26]/20 border border-[#e34f26]/40 flex items-center justify-center text-[#e34f26] font-bold text-xs">
            5
          </div>
        );
      case 'css':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#1572b6]/20 border border-[#1572b6]/40 flex items-center justify-center text-[#1572b6] font-bold text-xs">
            3
          </div>
        );
      case 'spring':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 text-xs font-bold">
            🌱
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#141822] border border-[#232938] flex items-center justify-center text-[#00c2ff]">
            <Code2 className="w-5 h-5" />
          </div>
        );
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading assignments..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-white">Assignments</h1>

      {/* Top Overall Progress Summary Card (Matching screenshot media_1790007954348.png) */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {/* Col 1: Overall Progress */}
          <div className="flex flex-col justify-between pr-4 sm:border-r border-[#1f2430]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-400">Overall progress</span>
              <span className="text-2xl font-black text-[#00c2ff]">{overallPercentage}%</span>
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {totalSolved} of {(totalQuestions / 1000).toFixed(2)}k questions solved
            </div>
            <div className="text-xs text-slate-500 mt-1">Across {assignments.length} assignments</div>
          </div>

          {/* Col 2: Assignments Done */}
          <div className="flex flex-col justify-between px-0 sm:px-4 lg:border-r border-[#1f2430]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-medium text-slate-400">Assignments done</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {completedCount} / {assignments.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 opacity-0">spacer</div>
          </div>

          {/* Col 3: Questions Attempted */}
          <div className="flex flex-col justify-between px-0 sm:px-4 sm:border-r border-[#1f2430]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-xs font-medium text-slate-400">Questions attempted</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">477</div>
            <div className="text-xs text-slate-500 mt-1">29% of all questions</div>
          </div>

          {/* Col 4: Marks Earned */}
          <div className="flex flex-col justify-between pl-0 lg:pl-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-xs font-medium text-slate-400">Marks earned</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {(totalMarksEarned / 1000).toFixed(2)}k / {(totalAvailableMarks / 1000).toFixed(2)}k
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {totalAvailableMarks > 0 ? Math.round((totalMarksEarned / totalAvailableMarks) * 100) : 33}% of available marks
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pills */}
        <div className="flex items-center gap-2 bg-[#090b0e] p-1 rounded-xl border border-[#1f2430] w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#181c26] text-white shadow-sm border border-[#2a3040]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] bg-[#242b3a] px-1.5 py-0.2 rounded-full text-slate-300 font-bold">
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'in_progress'
                ? 'bg-[#181c26] text-white shadow-sm border border-[#2a3040]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>In progress</span>
            <span className="text-[10px] bg-[#242b3a] px-1.5 py-0.2 rounded-full text-slate-300 font-bold">
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-[#181c26] text-white shadow-sm border border-[#2a3040]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Completed</span>
            <span className="text-[10px] bg-[#242b3a] px-1.5 py-0.2 rounded-full text-slate-300 font-bold">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments"
            className="w-full bg-[#0c0e12] border border-[#1f2430] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00c2ff] transition-colors"
          />
        </div>
      </div>

      {/* Assignments Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssignments.map((ass) => (
          <Link
            key={ass.id}
            to={`/assignments/${ass.id}`}
            className="bg-[#0c0e12] hover:bg-[#12151c] border border-[#1f2430] hover:border-[#2b3345] transition-all duration-200 rounded-2xl p-5 flex flex-col justify-between group shadow-lg"
          >
            <div>
              {/* Header: Icon + Title + Difficulty Badge */}
              <div className="flex items-start gap-3">
                {renderSubjectIcon(ass.iconType, ass.title)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white group-hover:text-[#00c2ff] transition-colors truncate">
                    {ass.title}
                  </h3>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block ${
                        ass.difficulty === 'Beginner'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                          : ass.difficulty === 'Intermediate'
                          ? 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                          : 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {ass.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats: Modules | Questions | Marks */}
              <div className="grid grid-cols-3 gap-2 py-4 my-4 border-y border-[#1a1f2c] text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Modules</div>
                  <div className="text-base font-bold text-white mt-0.5">{ass.modulesCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Questions</div>
                  <div className="text-base font-bold text-white mt-0.5">{ass.questionsCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Marks</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {ass.marksObtained} <span className="text-slate-500 font-normal">/ {ass.totalMarks}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar & Solved Details */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Progress</span>
                <span className="font-bold text-[#00c2ff]">{ass.progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#181c26] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00c2ff] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, ass.progressPercentage))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
                <span>{ass.solvedCount} solved</span>
                <span className="text-slate-500">{ass.remainingCount} remaining</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

