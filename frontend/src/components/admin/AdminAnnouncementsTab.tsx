import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle2,
  AlertCircle,
  Bell,
  Link as LinkIcon,
  Users,
  Info,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';
import { BatchItem, AnnouncementCreateRequest } from '../../types';

interface AdminAnnouncementsTabProps {
  batches: BatchItem[];
}

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({ batches }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [targetBatchId, setTargetBatchId] = useState<string>('ALL');
  const [linkUrl, setLinkUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local log of sent broadcasts during this session
  const [recentBroadcasts, setRecentBroadcasts] = useState<Array<{
    title: string;
    message: string;
    type: string;
    batchName: string;
    timestamp: string;
  }>>([]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !message.trim()) {
      setError('Announcement title and message content are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AnnouncementCreateRequest = {
        title: title.trim(),
        message: message.trim(),
        type,
        targetBatchId: targetBatchId !== 'ALL' ? Number(targetBatchId) : undefined,
        linkUrl: linkUrl.trim() || undefined,
      };

      await api.post('/admin/announcements', payload);

      const targetBatchObj = batches.find((b) => String(b.id) === targetBatchId);
      const batchName = targetBatchObj ? targetBatchObj.name : 'All Students (Platform-Wide)';

      setRecentBroadcasts([
        {
          title: title.trim(),
          message: message.trim(),
          type,
          batchName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...recentBroadcasts,
      ]);

      setTitle('');
      setMessage('');
      setLinkUrl('');
      setSuccessMsg('Announcement successfully dispatched to student portals and notifications feed!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to broadcast announcement', err);
      setError(err.response?.data?.message || 'Failed to dispatch announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-brand-600" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Platform & Cohort Broadcast Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Publish real-time announcements, urgent deadlines, and updates directly into student dashboard notification feeds and header marquees.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            <span>Compose Dispatch</span>
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule Update: Midterm Assessment Window Extended"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Audience (Cohort)
                </label>
                <select
                  value={targetBatchId}
                  onChange={(e) => setTargetBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="ALL">All Cohorts & Students (System-wide)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Severity / Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="ANNOUNCEMENT">General Announcement (Blue)</option>
                  <option value="ALERT">Critical Deadline Alert (Red)</option>
                  <option value="UPDATE">Curriculum / Platform Update (Green)</option>
                  <option value="EXAM_NOTICE">Exam Notice (Cyan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Body *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose full message details, instructions, action items for learners..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Resource Link URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none font-mono text-[11px]"
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Dispatching Broadcast...' : 'Broadcast Announcement'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Broadcasts Stream */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Recent Broadcasts Stream
          </h3>

          {recentBroadcasts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>No broadcast dispatches sent during this session.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {recentBroadcasts.map((b, i) => (
                <div key={i} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {b.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{b.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {b.message}
                  </p>
                  <div className="text-[10px] text-brand-600 font-mono">
                    Audience: {b.batchName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
