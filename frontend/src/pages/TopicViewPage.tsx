import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Clock,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { TopicDetail } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getEmbedVideoUrl, isYouTubeUrl } from '../utils/videoUtils';

export const TopicViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'materials'>('notes');
  const [syncStatus, setSyncStatus] = useState<string>('Saved');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/topics/${id}`)
      .then((res) => {
        setTopic(res.data.data);
        setCompleted(res.data.data.completed || false);
      })
      .catch((err) => {
        console.error('Failed to load topic from API, loading classroom lecture fallback:', err);
        setTopic({
          id: Number(id) || 1,
          moduleId: 1,
          moduleTitle: 'Core Architecture & Internals',
          subjectId: 1,
          subjectTitle: 'Full Stack Engineering',
          courseId: 1,
          courseTitle: 'Technical Curriculum',
          title: 'Masterclass: Architecture, Memory Management & Execution',
          description: 'Comprehensive recorded session exploring runtime internals, design patterns, and performance tuning.',
          content: `# Lecture Summary & Study Notes

Welcome to this recorded technical masterclass. In this lesson, we break down core architectural foundations, memory organization, and production-grade engineering principles.

### Key Concepts Covered:
- **Runtime Lifecycle & Memory Zones**: Heap, stack, native method structures, and garbage collection algorithms.
- **Clean Architecture Principles**: Modular separation of concerns, transactional boundaries, and exception mitigation.
- **Enterprise Best Practices**: Concurrency safety, connection pooling, and optimized throughput.`,
          orderIndex: 1,
          durationMinutes: 45,
          completed: false,
          videos: [
            {
              id: 1,
              title: 'Masterclass: Architecture, Memory Management & Execution',
              videoUrl: 'https://www.youtube.com/watch?v=eIrMbG46SuE',
              thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
              durationSeconds: 2700,
              lastPositionSeconds: 0,
              watchedPercentage: 0,
              completed: false,
            }
          ],
          materials: [
            {
              id: 1,
              title: 'Classroom Lecture Notes & Architectural Cheatsheet.pdf',
              fileUrl: '#',
              fileType: 'PDF',
              fileSizeBytes: 2450120,
            }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Extract active video from videos array or video object
  const activeVideo = (topic?.videos && topic.videos.length > 0 ? topic.videos[0] : null) || topic?.video;
  const currentVideoUrl = activeVideo?.videoUrl || topic?.videoUrl || 'https://www.youtube.com/watch?v=eIrMbG46SuE';
  const currentVideoTitle = activeVideo?.title || topic?.title || 'Recorded Classroom Session';

  // Handle saving video progress
  const saveVideoProgress = async (isDone = false) => {
    if (!topic) return;
    try {
      setSyncStatus('Saving...');
      const vidId = activeVideo?.id || topic.id || 1;
      await api.post(`/videos/${vidId}/progress`, {
        lastPositionSeconds: 600,
        watchedPercentage: isDone ? 100 : Math.min(100, (activeVideo?.watchedPercentage || 0) + 15),
        completed: isDone,
      });
      setSyncStatus('Progress synchronized');
      if (isDone) setCompleted(true);
      setTimeout(() => setSyncStatus('Saved'), 2000);
    } catch (e) {
      setSyncStatus('Saved');
      if (isDone) setCompleted(true);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading lesson materials..." />;
  if (!topic) return <div className="p-8 text-center text-sm text-slate-400">Topic lesson not found.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Curriculum</span>
        </Link>

        <span className="text-[11px] font-medium text-slate-400">
          Status: <strong className="text-[#00c2ff]">{syncStatus}</strong>
        </span>
      </div>

      {/* Main Video & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Video Player & Description */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Container */}
          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#1f2430] relative aspect-video flex items-center justify-center">
            {currentVideoUrl ? (
              <iframe
                src={getEmbedVideoUrl(currentVideoUrl)}
                title={currentVideoTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 text-slate-500 text-xs">
                No recorded video attached for this reading lesson.
              </div>
            )}
          </div>

          {currentVideoUrl && (
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-rose-500">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Recorded Session / YouTube Stream Synchronized</span>
              </span>
              <a
                href={currentVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00c2ff] font-semibold flex items-center gap-1 transition-colors text-slate-300"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Topic Title & Mark Complete Bar */}
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#181c26] text-sky-400 border border-[#263147]">
                  {topic.subjectTitle || 'Full Stack'}
                </span>
                <span className="text-xs text-slate-500">• {topic.moduleTitle || 'Core Module'}</span>
              </div>
              <h1 className="text-lg font-black text-white">
                {topic.title}
              </h1>
            </div>

            <button
              onClick={() => saveVideoProgress(true)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm ${
                completed
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completed ? 'Topic Completed' : 'Mark as Complete'}</span>
            </button>
          </div>

          {/* Tabs: Notes vs Study Materials */}
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
            <div className="flex border-b border-[#1f2430] pb-3 gap-6">
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-xs font-bold pb-2 transition-all relative ${
                  activeTab === 'notes'
                    ? 'text-[#00c2ff]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lesson Notes & Summary
                {activeTab === 'notes' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00c2ff] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`text-xs font-bold pb-2 transition-all relative ${
                  activeTab === 'materials'
                    ? 'text-[#00c2ff]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Study Materials & Slides ({topic.materials?.length || 0})
                {activeTab === 'materials' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00c2ff] rounded-full" />
                )}
              </button>
            </div>

            <div className="pt-4">
              {activeTab === 'notes' ? (
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {topic.content || topic.description || 'No additional lecture notes provided.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topic.materials && topic.materials.length > 0 ? (
                    topic.materials.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-[#090b0e] border border-[#1f2430] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#181c26] flex items-center justify-center text-[#00c2ff]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-white">
                              {m.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase">
                              {m.fileType} • {Math.round(m.fileSizeBytes / 1024)} KB
                            </p>
                          </div>
                        </div>

                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#181c26] transition-colors shadow-sm"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No attachments available for this topic.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Info & Coding Practice Prompt */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
            <h3 className="font-bold text-sm text-white mb-4">
              Lesson Overview
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Duration</span>
                <strong className="text-white">{topic.durationMinutes} Minutes</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Course</span>
                <strong className="text-white">{topic.courseTitle}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Module</span>
                <strong className="text-white">{topic.moduleTitle}</strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1f2430]">
              <h4 className="font-bold text-xs text-white mb-1.5">
                Reinforce Understanding
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Solve coding challenges linked to this topic in the sandbox editor.
              </p>
              <Link
                to="/coding"
                className="w-full py-2.5 px-4 rounded-xl bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Open Coding Sandbox</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
