import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  QrCode,
  ListFilter,
  LayoutGrid,
  Info
} from 'lucide-react';
import api from '../../api/client';
import { CalendarAttendanceResponse, CalendarDayStat } from '../../types';

export const AttendanceCalendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState<CalendarAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<CalendarDayStat | null>(null);

  const fetchCalendar = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/calendar', {
        params: { year, month }
      });
      const data = res.data?.data;
      setCalendarData(data || null);
      // Auto-select today if present in data
      if (data?.days) {
        const todayStr = new Date().toISOString().split('T')[0];
        const match = data.days.find((d: CalendarDayStat) => d.date === todayStr);
        setSelectedDay(match || data.days[data.days.length - 1] || null);
      }
    } catch (err) {
      console.error('Failed to fetch attendance calendar', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar grid calculation
  // Days of week starting Monday: Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6), Sun(0)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const leadingBlankDays = (firstDayOfMonth + 6) % 7;

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysMap = React.useMemo(() => {
    const map: Record<string, CalendarDayStat> = {};
    if (calendarData?.days) {
      calendarData.days.forEach((d) => {
        map[d.date] = d;
      });
    }
    return map;
  }, [calendarData]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 rounded-3xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#00c2ff]" />
            <h2 className="text-base font-black text-white tracking-tight">
              Monthly Attendance Register
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified classroom sessions with real-time QR check-in status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-[#141720] border border-[#1e2330] flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#00b4d8] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#00b4d8] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-[#141720] border border-[#1e2330] rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f2430] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white"
            >
              {monthNames[currentMonth - 1]} {currentYear}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f2430] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#12151c] border border-[#1d2331]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sessions
          </span>
          <div className="text-xl font-black text-white mt-0.5">
            {calendarData?.totalSessions ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Class lectures</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12151c] border border-emerald-900/30">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Present
          </span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">
            {calendarData?.presentCount ?? 0}
          </div>
          <span className="text-[10px] text-emerald-500/80 font-medium">Verified in session</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12151c] border border-rose-900/30">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            Absent
          </span>
          <div className="text-xl font-black text-rose-400 mt-0.5">
            {calendarData?.absentCount ?? 0}
          </div>
          <span className="text-[10px] text-rose-500/80 font-medium">Missed lectures</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12151c] border border-cyan-900/30">
          <span className="text-[10px] font-bold text-[#00c2ff] uppercase tracking-wider">
            Monthly Rate
          </span>
          <div className="text-xl font-black text-[#00c2ff] mt-0.5">
            {calendarData ? `${calendarData.attendancePercentage}%` : '0%'}
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">
            {calendarData && calendarData.attendancePercentage >= 75 ? 'Placement Eligible' : 'Needs > 75%'}
          </span>
        </div>
      </div>

      {/* Main Content: Grid vs List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00c2ff] border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing attendance records...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-1.5 bg-[#10131a] rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading days */}
            {Array.from({ length: leadingBlankDays }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[70px] sm:min-h-[82px] rounded-xl bg-[#090b0e]/40 border border-[#141822]/40"
              />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayStat = daysMap[dateStr];
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay?.date === dateStr;

              let statusBg = 'bg-[#10131a] border-[#181d27] text-slate-400';
              let badge = null;

              if (dayStat?.status === 'PRESENT') {
                statusBg = 'bg-emerald-950/25 border-emerald-800/40 text-emerald-300 hover:border-emerald-600/60';
                badge = (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-800/60">
                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="hidden sm:inline">Present</span>
                  </span>
                );
              } else if (dayStat?.status === 'ABSENT') {
                statusBg = 'bg-rose-950/25 border-rose-800/40 text-rose-300 hover:border-rose-600/60';
                badge = (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded-md border border-rose-800/60">
                    <XCircle className="w-2.5 h-2.5 shrink-0" />
                    <span className="hidden sm:inline">Absent</span>
                  </span>
                );
              }

              return (
                <button
                  type="button"
                  key={dateStr}
                  onClick={() => dayStat && setSelectedDay(dayStat)}
                  disabled={!dayStat}
                  className={`min-h-[70px] sm:min-h-[82px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${statusBg} ${
                    isSelected ? 'ring-2 ring-[#00c2ff] shadow-lg shadow-cyan-950/50' : ''
                  } ${dayStat ? 'cursor-pointer hover:bg-[#161a24]' : 'cursor-default opacity-60'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#00b4d8] text-slate-950 flex items-center justify-center font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayStat?.source === 'QR_SCAN' && (
                      <span title="Verified via QR Scan" className="text-[#00c2ff]">
                        <QrCode className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    {badge || <span className="text-[9px] text-slate-600 font-medium">No Class</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Day Inspector */}
          {selectedDay && (
            <div className="p-4 rounded-2xl bg-[#10131a] border border-[#1e2330] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {selectedDay.date} ({selectedDay.dayOfWeek})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedDay.status === 'PRESENT'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                        : selectedDay.status === 'ABSENT'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedDay.status === 'PRESENT' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {selectedDay.status}
                  </span>
                </div>
                <div className="text-xs font-black text-white">
                  {selectedDay.sessionTitle || 'Classroom Session'}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                {selectedDay.markedAt && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Marked: {selectedDay.markedAt}
                  </span>
                )}
                {selectedDay.source && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#181f2e] text-[#00c2ff] text-[10px] font-bold border border-[#222c42]">
                    <QrCode className="w-3 h-3" />
                    {selectedDay.source}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List Mode View */
        <div className="space-y-2">
          {(!calendarData?.days || calendarData.days.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No sessions scheduled for this month.
            </div>
          ) : (
            calendarData.days.map((day) => (
              <div
                key={day.date}
                className="p-3.5 rounded-2xl bg-[#10131a] border border-[#191d27] flex items-center justify-between hover:bg-[#141822] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 text-center font-mono">
                    <span className="text-xs font-black text-slate-200">
                      {day.date.split('-')[2]}
                    </span>
                    <span className="block text-[9px] text-slate-400 uppercase">
                      {day.dayOfWeek.slice(0, 3)}
                    </span>
                  </div>
                  <div className="border-l border-[#1f2430] pl-3">
                    <h4 className="text-xs font-bold text-white">
                      {day.sessionTitle || 'Class Lecture Session'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {day.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {day.source && (
                    <span className="text-[10px] font-mono text-[#00c2ff] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 hidden sm:inline">
                      {day.source}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      day.status === 'PRESENT'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {day.status === 'PRESENT' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {day.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
