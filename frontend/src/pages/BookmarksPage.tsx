import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Code2,
  BookOpen,
  ArrowRight,
  Trash2
} from 'lucide-react';
import api from '../api/client';
import { BookmarkItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = () => {
    api.get('/bookmarks')
      .then((res) => setBookmarks(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const removeBookmark = async (itemType: string, itemId: number) => {
    try {
      await api.post('/bookmarks/toggle', { itemType, itemId });
      setBookmarks((prev) => prev.filter((b) => !(b.itemType === itemType && b.itemId === itemId)));
    } catch (e) {}
  };

  if (loading) return <LoadingSpinner fullPage message="Loading your personal bookmarks library..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-[#00c2ff]" />
          Saved Bookmarks & Quick Revision
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review saved algorithmic problems, complex MCQs, and bookmarked topic lessons.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-white">
            No Bookmarks Saved Yet
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click the bookmark ribbon icon on any question or lecture note to save it here for fast revision.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] hover:border-[#283244] shadow-xl flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {b.itemType}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {b.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => removeBookmark(b.itemType, b.itemId)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-[#181c26] rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={b.linkUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 hover:text-[#00c2ff] font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

