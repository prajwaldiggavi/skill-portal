import React, { useEffect, useState } from 'react';
import {
  FolderArchive,
  Download,
  FileText,
  FileCode,
  Search,
  BookOpen
} from 'lucide-react';
import api from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/materials')
      .then((res) => setMaterials(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.topicTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullPage message="Loading course study materials & resources..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-[#00c2ff]" />
            Study Materials & Lecture Notes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download architectural diagrams, presentation slides, and source code repositories.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0c0e12] border border-[#1f2430] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] outline-none shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] hover:border-[#283244] shadow-xl flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#181c26] flex items-center justify-center text-[#00c2ff]">
                  {mat.fileType === 'PDF' ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#181c26] text-slate-400 border border-[#263147]">
                  {mat.fileType} • {Math.round(mat.fileSizeBytes / 1024)} KB
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-white">
                {mat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Linked to topic: <strong className="text-slate-200">{mat.topicTitle}</strong>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a1f2c] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Official Material</span>
              <a
                href={mat.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 hover:text-[#00c2ff] font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

