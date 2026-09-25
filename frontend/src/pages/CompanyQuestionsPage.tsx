import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ChevronRight } from 'lucide-react';

interface CompanyCard {
  id: number;
  name: string;
  logoText: string;
  logoBg: string;
  tags: string[];
}

export const CompanyQuestionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  const companies: CompanyCard[] = [
    { id: 1, name: 'TechnoRishi', logoText: 'TR', logoBg: 'bg-emerald-600', tags: ['JDBC', 'SQL', 'JEE', 'Spring', 'Adv Java'] },
    { id: 2, name: 'Virtusa', logoText: 'V', logoBg: 'bg-teal-600', tags: ['Core Java', 'Programming', 'SQL', 'Javascript'] },
    { id: 3, name: 'ThoughtsCrest Software', logoText: 'TC', logoBg: 'bg-amber-600', tags: ['Programming'] },
    { id: 4, name: 'Agile Point', logoText: 'AP', logoBg: 'bg-sky-600', tags: ['Programming'] },
    { id: 5, name: 'Baryons Software Solutions', logoText: 'BS', logoBg: 'bg-slate-700', tags: ['Core Java', 'Programming', 'SQL', 'Hibernate'] },
    { id: 6, name: 'XPLORIA', logoText: 'XP', logoBg: 'bg-lime-600', tags: ['DSA'] },
    { id: 7, name: 'ThoughtMakes AI', logoText: 'TM', logoBg: 'bg-cyan-600', tags: ['Core Java'] },
    { id: 8, name: 'Stanverse Technologies', logoText: 'ST', logoBg: 'bg-blue-600', tags: ['Core Java'] },
    { id: 9, name: 'iMatiz', logoText: 'iM', logoBg: 'bg-teal-600', tags: ['Core Java'] },
    { id: 10, name: 'BridgeLabz', logoText: 'BL', logoBg: 'bg-orange-600', tags: ['Core Java'] },
    { id: 11, name: 'Bandhoo Solutions', logoText: 'BS', logoBg: 'bg-yellow-600', tags: ['Programming'] },
    { id: 12, name: 'IBM', logoText: 'IBM', logoBg: 'bg-blue-700', tags: ['Programming'] },
    { id: 13, name: 'Molecular Connections', logoText: 'MC', logoBg: 'bg-orange-700', tags: ['Programming'] },
    { id: 14, name: 'Sigmoid', logoText: 'S', logoBg: 'bg-red-600', tags: ['Core Java', 'SQL'] },
    { id: 15, name: 'Moolys Software Testing', logoText: 'MS', logoBg: 'bg-emerald-600', tags: ['Programming'] },
    { id: 16, name: 'Appxcelerate', logoText: 'AX', logoBg: 'bg-blue-600', tags: ['Core Java', 'SQL'] },
    { id: 17, name: 'Saina cloud Software', logoText: 'SC', logoBg: 'bg-cyan-700', tags: ['Core Java', 'SQL'] },
    { id: 18, name: 'IonIdea', logoText: 'II', logoBg: 'bg-rose-600', tags: ['Core Java', 'Programming', 'SQL'] },
    { id: 19, name: 'DATAZOIC MACHINES PVT. LTD', logoText: 'DZ', logoBg: 'bg-amber-700', tags: ['Core Java', 'Programming', 'JDBC', 'SQL', 'DSA'] },
    { id: 20, name: 'Zeta', logoText: 'Z', logoBg: 'bg-sky-700', tags: ['Core Java', 'Programming', 'SQL', 'DSA'] },
  ];

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Company Questions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Practice curated interview and screening problem sets from top companies.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name..."
            className="w-full bg-[#12151c] border border-[#1e2330] focus:border-[#00b4d8] text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => alert('Filter drawer')}
          className="px-4 py-2.5 bg-[#12151c] border border-[#1e2330] hover:bg-[#181c26] text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((c) => {
          const isFav = !!favorites[c.id];
          return (
            <div
              key={c.id}
              className="bg-[#12151c] border border-[#1e2330] hover:border-[#2f394c] rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${c.logoBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {c.logoText}
                  </div>
                  <h3 className="text-xs font-bold text-white truncate" title={c.name}>
                    {c.name}
                  </h3>
                </div>

                <button
                  onClick={(e) => toggleFavorite(c.id, e)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                  title="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[44px]">
                {c.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#181c26] border border-[#232936] text-[10px] font-medium text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1a1f2c]">
                <Link
                  to="/coding"
                  className="text-xs font-bold text-[#38bdf8] hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
