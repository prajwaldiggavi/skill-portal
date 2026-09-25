import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Plus,
  Trash2,
  FileText,
  Video,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
  BookOpen,
  Eye,
  Play,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import api from '../../api/client';
import {
  MaterialAdminItem,
  MaterialCreateRequest,
  VideoCreateRequest,
  VideoAdminItem,
  CourseItem
} from '../../types';
import {
  getEmbedVideoUrl,
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
  formatDuration
} from '../../utils/videoUtils';

interface AdminMaterialsTabProps {
  courses: CourseItem[];
}

export const AdminMaterialsTab: React.FC<AdminMaterialsTabProps> = ({ courses }) => {
  const [materials, setMaterials] = useState<MaterialAdminItem[]>([]);
  const [videos, setVideos] = useState<VideoAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Subtab: documents vs videos
  const [activeSubtab, setActiveSubtab] = useState<'materials' | 'videos'>('materials');

  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoAdminItem | null>(null);

  // Topics for course dropdown in video modal
  const [selectedCourseForVideo, setSelectedCourseForVideo] = useState<number | ''>(courses.length > 0 ? courses[0].id : '');
  const [availableTopics, setAvailableTopics] = useState<{ id: number; title: string; moduleTitle?: string }[]>([]);

  // Material Form
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    courseId: courses.length > 0 ? courses[0].id : undefined as number | undefined,
    materialType: 'PDF',
    fileUrl: '',
    fileSizeBytes: 1048576, // 1MB default
    published: true,
  });

  // Video Form
  const [videoForm, setVideoForm] = useState({
    topicId: 1,
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    durationSeconds: 1800, // 30 mins default
    orderIndex: 0,
    published: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const [matRes, vidRes] = await Promise.all([
        api.get('/admin/materials'),
        api.get('/admin/videos')
      ]);
      setMaterials(matRes.data?.data || []);
      setVideos(vidRes.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load study resources', err);
      setError(err.response?.data?.message || 'Failed to load study resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Fetch topics when course changes in video modal
  const loadTopicsForCourse = async (cId: number) => {
    try {
      const res = await api.get(`/courses/${cId}`);
      const courseData = res.data?.data;
      const topicList: { id: number; title: string; moduleTitle?: string }[] = [];
      if (courseData?.subjects) {
        courseData.subjects.forEach((s: any) => {
          if (s.modules) {
            s.modules.forEach((m: any) => {
              if (m.topics) {
                m.topics.forEach((t: any) => {
                  topicList.push({ id: t.id, title: t.title, moduleTitle: m.title });
                });
              }
            });
          }
        });
      }
      setAvailableTopics(topicList);
      if (topicList.length > 0) {
        setVideoForm((prev) => ({ ...prev, topicId: topicList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load topics for course', e);
    }
  };

  useEffect(() => {
    if (selectedCourseForVideo) {
      loadTopicsForCourse(Number(selectedCourseForVideo));
    }
  }, [selectedCourseForVideo]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteMaterial = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete material "${title}"?`)) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      showNotification('Study material removed.');
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  const handleDeleteVideo = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete video "${title}"?`)) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      showNotification('Video lecture removed.');
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete video.');
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!materialForm.title.trim() || !materialForm.fileUrl.trim()) {
      setFormError('Title and File URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: MaterialCreateRequest = {
        title: materialForm.title.trim(),
        description: materialForm.description.trim(),
        courseId: materialForm.courseId,
        materialType: materialForm.materialType,
        fileUrl: materialForm.fileUrl.trim(),
        fileSizeBytes: Number(materialForm.fileSizeBytes),
        published: materialForm.published,
      };

      await api.post('/admin/materials', payload);
      setShowMaterialModal(false);
      setMaterialForm({
        title: '',
        description: '',
        courseId: courses.length > 0 ? courses[0].id : undefined,
        materialType: 'PDF',
        fileUrl: '',
        fileSizeBytes: 1048576,
        published: true,
      });
      showNotification('Study material published successfully!');
      fetchResources();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!videoForm.title.trim() || !videoForm.videoUrl.trim()) {
      setFormError('Video Title and URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const embedUrl = getEmbedVideoUrl(videoForm.videoUrl);
      const ytThumb = getYouTubeThumbnail(videoForm.videoUrl);

      const payload: VideoCreateRequest = {
        topicId: Number(videoForm.topicId),
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        videoUrl: embedUrl,
        thumbnailUrl: videoForm.thumbnailUrl.trim() || ytThumb || '',
        durationSeconds: Number(videoForm.durationSeconds),
        orderIndex: Number(videoForm.orderIndex),
        published: videoForm.published,
      };

      await api.post('/admin/videos', payload);
      setShowVideoModal(false);
      setVideoForm({
        topicId: availableTopics.length > 0 ? availableTopics[0].id : 1,
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        durationSeconds: 1800,
        orderIndex: 0,
        published: true,
      });
      showNotification('Video lecture attached to topic successfully!');
      fetchResources();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create video.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Quick auto-populate helper when typing YouTube URL
  const handleVideoUrlInput = (url: string) => {
    const ytThumb = getYouTubeThumbnail(url);
    setVideoForm((prev) => ({
      ...prev,
      videoUrl: url,
      thumbnailUrl: prev.thumbnailUrl || (ytThumb ? ytThumb : ''),
    }));
  };

  const activeYtId = getYouTubeVideoId(videoForm.videoUrl);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Study Materials & Video Lectures
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload PDF slides, code archives, or embed YouTube video masterclasses linked directly to curriculum topics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchResources()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Resources"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowMaterialModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload / Link Material</span>
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowVideoModal(true);
              }}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Attach YouTube / Video</span>
            </button>
          </div>
        </div>

        {/* Subtabs Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubtab('materials')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubtab === 'materials'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents & Slides ({materials.length})</span>
          </button>
          <button
            onClick={() => setActiveSubtab('videos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubtab === 'videos'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Lectures & YouTube ({videos.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubtab === 'materials' ? (
        /* Materials List */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading resources...</div>
          ) : error ? (
            <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
          ) : materials.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No study materials uploaded yet. Click "Upload / Link Material" to add documents.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {materials.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/80 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                      {m.materialType || 'DOC'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {m.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        {m.courseTitle && <span>Course: {m.courseTitle}</span>}
                        {m.subjectTitle && <span>• Subject: {m.subjectTitle}</span>}
                        {m.fileSizeBytes > 0 && <span>• Size: {formatBytes(m.fileSizeBytes)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Open Resource URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteMaterial(m.id, m.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Video Lectures List */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading videos...</div>
          ) : error ? (
            <div className="py-8 text-center text-rose-500 text-xs font-semibold">{error}</div>
          ) : videos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <p>No video lectures attached yet.</p>
              <button
                onClick={() => {
                  setFormError(null);
                  setShowVideoModal(true);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Attach First YouTube Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => {
                const isYt = isYouTubeUrl(v.videoUrl);
                const thumb = v.thumbnailUrl || getYouTubeThumbnail(v.videoUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400';

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-sm group"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={thumb}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewVideo(v)}
                            className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            title="Preview Video"
                          >
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </button>
                        </div>
                        {isYt && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                            YouTube
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold">
                          {formatDuration(v.durationSeconds)}
                        </span>
                      </div>

                      {/* Video Info */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {v.description || 'No description provided.'}
                        </p>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-1">
                          {v.topicTitle && (
                            <div className="flex items-center gap-1 font-semibold text-cyan-400">
                              <BookOpen className="w-3 h-3" />
                              <span className="truncate">Topic: {v.topicTitle}</span>
                            </div>
                          )}
                          {v.courseTitle && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Layers className="w-3 h-3" />
                              <span className="truncate">{v.courseTitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setPreviewVideo(v)}
                        className="font-bold text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Watch Preview</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteVideo(v.id, v.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* UPLOAD / LINK MATERIAL MODAL */}
      {/* ========================================================= */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Upload / Link Study Material</h3>
              <button onClick={() => setShowMaterialModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Java Collections Architecture Slides"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Association</label>
                <select
                  value={materialForm.courseId || ''}
                  onChange={(e) => setMaterialForm({ ...materialForm, courseId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                >
                  <option value="">-- General / No Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Material Type</label>
                  <select
                    value={materialForm.materialType}
                    onChange={(e) => setMaterialForm({ ...materialForm, materialType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document</option>
                    <option value="ZIP">Code Archive / Zip</option>
                    <option value="SLIDES">Presentation Slides</option>
                    <option value="LINK">External Website Link</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">File Size (Bytes)</label>
                  <input
                    type="number"
                    value={materialForm.fileSizeBytes}
                    onChange={(e) => setMaterialForm({ ...materialForm, fileSizeBytes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">File or Download URL *</label>
                <input
                  type="url"
                  required
                  value={materialForm.fileUrl}
                  onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                  placeholder="https://example.com/materials/java-collections.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Brief summary of what this document covers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTACH YOUTUBE / VIDEO MODAL */}
      {/* ========================================================= */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Attach YouTube Video / Recorded Lecture
                </h3>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateVideo} className="space-y-3.5 text-xs">
              {/* Course & Topic Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseForVideo}
                    onChange={(e) => setSelectedCourseForVideo(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Topic Lesson *
                  </label>
                  {availableTopics.length > 0 ? (
                    <select
                      value={videoForm.topicId}
                      onChange={(e) => setVideoForm({ ...videoForm, topicId: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    >
                      {availableTopics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} (ID: {t.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      required
                      value={videoForm.topicId}
                      onChange={(e) => setVideoForm({ ...videoForm, topicId: Number(e.target.value) })}
                      placeholder="Topic ID"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Video Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Masterclass: Spring Boot Architecture & DI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                />
              </div>

              {/* YouTube / Video URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    YouTube Stream / Video URL *
                  </label>
                  {activeYtId && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>YouTube ID: {activeYtId}</span>
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={videoForm.videoUrl}
                  onChange={(e) => handleVideoUrlInput(e.target.value)}
                  placeholder="Paste YouTube watch URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports standard watch links (<code className="font-mono">youtube.com/watch?v=...</code>), share links (<code className="font-mono">youtu.be/...</code>), and embed URLs. Automatically converted for seamless playback.
                </p>
              </div>

              {/* Live Video Preview Container */}
              {activeYtId && (
                <div className="space-y-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                    Live YouTube Preview:
                  </span>
                  <div className="rounded-xl overflow-hidden aspect-video bg-black shadow">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeYtId}`}
                      title="YouTube Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={videoForm.durationSeconds}
                    onChange={(e) => setVideoForm({ ...videoForm, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    ≈ {formatDuration(videoForm.durationSeconds)}
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thumbnail URL (Auto from YouTube)
                  </label>
                  <input
                    type="url"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Key concepts, timestamps, and lecture breakdown..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  <Video className="w-4 h-4" />
                  <span>{submitting ? 'Attaching...' : 'Attach Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WATCH PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-current" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {previewVideo.title}
                </h3>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black w-full">
              <iframe
                src={getEmbedVideoUrl(previewVideo.videoUrl)}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[10px]">
                    {previewVideo.courseTitle || 'Course Lesson'}
                  </span>
                  <span className="text-slate-400">• {previewVideo.topicTitle}</span>
                </div>
                <span className="text-slate-400 font-mono">
                  Duration: {formatDuration(previewVideo.durationSeconds)}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                {previewVideo.description || 'No lecture description provided.'}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <a
                  href={previewVideo.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
