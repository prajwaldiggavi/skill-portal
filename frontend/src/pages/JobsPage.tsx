import React from 'react';
import { Briefcase, Building2, MapPin, DollarSign, ChevronRight } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const jobs = [
    { id: 1, role: 'Associate Software Engineer', company: 'TCS', location: 'Bangalore', ctc: '4.5 - 7.0 LPA', deadline: 'In 3 days', tags: ['Java', 'Spring Boot', 'SQL'] },
    { id: 2, role: 'Full Stack Java Developer', company: 'Infosys', location: 'Hyderabad', ctc: '5.0 - 8.5 LPA', deadline: 'In 5 days', tags: ['React', 'Java', 'MySQL'] },
    { id: 3, role: 'Junior Python / Cloud Engineer', company: 'Capgemini', location: 'Pune', ctc: '4.8 - 6.5 LPA', deadline: 'In 1 week', tags: ['Python', 'DSA', 'AWS'] },
    { id: 4, role: 'Software Development Engineer (SDE-1)', company: 'Virtusa', location: 'Chennai', ctc: '6.0 - 9.0 LPA', deadline: 'In 2 weeks', tags: ['Core Java', 'Data Structures'] },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Placement Drives & Job Openings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Exclusive campus and off-campus recruitment opportunities for certified students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 space-y-4 hover:border-[#2f394c] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  {j.deadline}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{j.role}</h3>
                <span className="text-xs text-[#38bdf8] font-semibold">{j.company}</span>
              </div>

              <span className="text-xs font-mono font-bold text-slate-200 bg-[#161922] px-2.5 py-1 rounded-lg border border-[#222734]">
                {j.ctc}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {j.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#181c26] text-slate-300 text-[10px]">
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1b202a] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {j.location}
              </span>
              <button
                onClick={() => alert(`Application submitted for ${j.role} at ${j.company}!`)}
                className="px-4 py-1.5 bg-[#00b4d8] hover:bg-[#0096c7] text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
