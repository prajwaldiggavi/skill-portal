import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  Eye,
  ExternalLink,
  Play
} from 'lucide-react';
import api from '../../api/client';
import {
  getEmbedVideoUrl,
  isYouTubeUrl,
  getYouTubeVideoId
} from '../../utils/videoUtils';
import {
  CourseItem,
  CourseCreateRequest,
  SubjectCreateRequest,
  ModuleCreateRequest,
  TopicCreateRequest,
  CourseDetail,
  SubjectDetail,
  ModuleDetail,
  TopicDetail
} from '../../types';

interface AdminCoursesTabProps {
  onCoursesUpdated?: () => void;
}

export const AdminCoursesTab: React.FC<AdminCoursesTabProps> = ({ onCoursesUpdated }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Course for Hierarchy Inspection
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Forms
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnailUrl: '',
    orderIndex: 0,
    published: true,
  });

  const [subjectForm, setSubjectForm] = useState({
    courseId: 0,
    title: '',
    description: '',
    orderIndex: 0,
    published: true,
  });

  const [moduleForm, setModuleForm] = useState({
    courseId: 0,
    subjectId: 0,
    title: '',
    description: '',
    orderIndex: 0,
    published: true,
  });

  const [topicForm, setTopicForm] = useState({
    courseId: 0,
    subjectId: 0,
    moduleId: 0,
    title: '',
    description: '',
    videoUrl: '',
    durationMinutes: 30,
    orderIndex: 0,
    published: true,
  });

  // Recorded video preview modal
  const [playingVideo, setPlayingVideo] = useState<{ title: string; videoUrl: string } | null>(null);

  // Quick attach recorded video to existing topic
  const [quickTopicVideo, setQuickTopicVideo] = useState<{ topicId: number; title: string } | null>(null);
  const [quickVideoUrl, setQuickVideoUrl] = useState('');
  const [quickDuration, setQuickDuration] = useState(30);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Expanded tree items
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/courses');
      const list = res.data?.data || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load courses', err);
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch course hierarchy when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseDetail(null);
      return;
    }
    setLoadingHierarchy(true);
    api.get(`/courses/${selectedCourseId}`)
      .then((res) => {
        setCourseDetail(res.data?.data || null);
      })
      .catch((err) => {
        console.error('Failed to fetch course hierarchy', err);
      })
      .finally(() => setLoadingHierarchy(false));
  }, [selectedCourseId]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!courseForm.title.trim()) {
      setFormError('Course title is required.');
      return;
    }

    const slug = courseForm.slug.trim() || courseForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    setSubmitting(true);
    try {
      const payload: CourseCreateRequest = {
        title: courseForm.title.trim(),
        slug,
        description: courseForm.description.trim(),
        thumbnailUrl: courseForm.thumbnailUrl.trim(),
        orderIndex: Number(courseForm.orderIndex),
        published: courseForm.published,
      };

      await api.post('/admin/courses', payload);
      setShowCourseModal(false);
      setCourseForm({
        title: '',
        slug: '',
        description: '',
        thumbnailUrl: '',
        orderIndex: 0,
        published: true,
      });
      showNotification('New course created successfully!');
      fetchCourses();
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"? This will archive all nested subjects and modules.`)) {
      return;
    }
    try {
      await api.delete(`/admin/courses/${courseId}`);
      showNotification(`Course "${title}" archived.`);
      fetchCourses();
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subjectForm.title.trim()) {
      setFormError('Subject title is required.');
      return;
    }
    const cId = subjectForm.courseId || selectedCourseId;
    if (!cId) {
      setFormError('Please select a course for this subject.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: SubjectCreateRequest = {
        courseId: cId,
        title: subjectForm.title.trim(),
        description: subjectForm.description.trim(),
        orderIndex: Number(subjectForm.orderIndex),
        published: subjectForm.published,
      };

      await api.post('/admin/subjects', payload);
      setShowSubjectModal(false);
      setSubjectForm({
        courseId: 0,
        title: '',
        description: '',
        orderIndex: 0,
        published: true,
      });
      showNotification('New subject created successfully!');
      // Refresh hierarchy
      if (selectedCourseId) {
        const res = await api.get(`/courses/${selectedCourseId}`);
        setCourseDetail(res.data?.data || null);
      }
      fetchCourses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!moduleForm.title.trim()) {
      setFormError('Module title is required.');
      return;
    }
    if (!moduleForm.subjectId) {
      setFormError('Please select a parent subject.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: ModuleCreateRequest = {
        subjectId: Number(moduleForm.subjectId),
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim(),
        orderIndex: Number(moduleForm.orderIndex),
        published: moduleForm.published,
      };

      await api.post('/admin/modules', payload);
      setShowModuleModal(false);
      setModuleForm({
        courseId: 0,
        subjectId: 0,
        title: '',
        description: '',
        orderIndex: 0,
        published: true,
      });
      showNotification('New module created successfully!');
      if (selectedCourseId) {
        const res = await api.get(`/courses/${selectedCourseId}`);
        setCourseDetail(res.data?.data || null);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!topicForm.title.trim()) {
      setFormError('Topic title is required.');
      return;
    }
    if (!topicForm.moduleId) {
      setFormError('Please select a parent module.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: TopicCreateRequest = {
        moduleId: Number(topicForm.moduleId),
        title: topicForm.title.trim(),
        description: topicForm.description.trim(),
        orderIndex: Number(topicForm.orderIndex),
        published: topicForm.published,
        videoUrl: topicForm.videoUrl.trim(),
        durationMinutes: Number(topicForm.durationMinutes),
      };

      await api.post('/admin/topics', payload);
      setShowTopicModal(false);
      setTopicForm({
        courseId: 0,
        subjectId: 0,
        moduleId: 0,
        title: '',
        description: '',
        videoUrl: '',
        durationMinutes: 30,
        orderIndex: 0,
        published: true,
      });
      showNotification('New topic and recorded session created successfully!');
      if (selectedCourseId) {
        const res = await api.get(`/courses/${selectedCourseId}`);
        setCourseDetail(res.data?.data || null);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAttachVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopicVideo || !quickVideoUrl.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/admin/videos', {
        topicId: quickTopicVideo.topicId,
        title: `Recorded Session: ${quickTopicVideo.title}`,
        videoUrl: quickVideoUrl.trim(),
        durationSeconds: Number(quickDuration) * 60,
        published: true,
      });
      showNotification(`Recorded session attached to ${quickTopicVideo.title}!`);
      setQuickTopicVideo(null);
      setQuickVideoUrl('');
      if (selectedCourseId) {
        const res = await api.get(`/courses/${selectedCourseId}`);
        setCourseDetail(res.data?.data || null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to attach video.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubject = (sId: number) => {
    setExpandedSubjects((prev) => ({ ...prev, [sId]: !prev[sId] }));
  };

  const toggleModule = (mId: number) => {
    setExpandedModules((prev) => ({ ...prev, [mId]: !prev[mId] }));
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

      {/* Header Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Curriculum Hierarchy Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Structure courses into hierarchical tree nodes: <span className="font-bold text-slate-700 dark:text-slate-300">Course &rarr; Subject &rarr; Module &rarr; Topic &rarr; Materials/Videos</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchCourses()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Courses"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowCourseModal(true);
              }}
              className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setSubjectForm((prev) => ({ ...prev, courseId: selectedCourseId || (courses[0]?.id ?? 0) }));
                setShowSubjectModal(true);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowModuleModal(true);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowTopicModal(true);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Courses list on Left, Hierarchical Tree on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Cards */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">
            Courses Catalog ({courses.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading catalog...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No courses defined yet.</div>
          ) : (
            courses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400">{course.slug}</span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {course.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id, course.title);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Archive Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {course.description || 'No description provided.'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{course.totalSubjects} Subjects</span>
                    <span>{course.totalStudents} Enrolled</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      course.published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Hierarchy Tree Explorer */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Curriculum Hierarchy Inspector</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {courseDetail ? courseDetail.title : 'Select a course to inspect its curriculum tree.'}
              </p>
            </div>
          </div>

          {loadingHierarchy ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading syllabus tree...</div>
          ) : !courseDetail || !courseDetail.subjects || courseDetail.subjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <p>No subjects added under this course yet.</p>
              <button
                onClick={() => {
                  setSubjectForm((prev) => ({ ...prev, courseId: selectedCourseId || 0 }));
                  setShowSubjectModal(true);
                }}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Add First Subject
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {courseDetail.subjects.map((subject, sIdx) => {
                const isSubExpanded = expandedSubjects[subject.id] !== false; // Default open
                return (
                  <div key={subject.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Subject Header */}
                    <div
                      onClick={() => toggleSubject(subject.id)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        {isSubExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                          S{sIdx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {subject.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {subject.modules?.length || 0} Modules
                      </span>
                    </div>

                    {/* Modules under subject */}
                    {isSubExpanded && (
                      <div className="p-3 pl-6 space-y-2 bg-white dark:bg-slate-900">
                        {(!subject.modules || subject.modules.length === 0) ? (
                          <div className="py-2 text-[11px] text-slate-400 italic">
                            No modules added to this subject yet.
                          </div>
                        ) : (
                          subject.modules.map((mod, mIdx) => {
                            const isModExpanded = expandedModules[mod.id] !== false;
                            return (
                              <div key={mod.id} className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">
                                <div
                                  onClick={() => toggleModule(mod.id)}
                                  className="p-2.5 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer hover:bg-slate-100/50"
                                >
                                  <div className="flex items-center gap-2">
                                    {isModExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    <span className="font-mono text-[10px] text-cyan-400 font-bold">
                                      M{mIdx + 1}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {mod.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {mod.topics?.length || 0} Topics
                                  </span>
                                </div>

                                {/* Topics under module */}
                                {isModExpanded && (
                                  <div className="p-2.5 pl-6 space-y-1.5 bg-slate-50/20 dark:bg-slate-900/40">
                                    {(!mod.topics || mod.topics.length === 0) ? (
                                      <div className="text-[10px] text-slate-400 italic">No topics in this module.</div>
                                    ) : (
                                      mod.topics.map((top, tIdx) => (
                                        <div
                                          key={top.id}
                                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-[10px] text-emerald-600 font-bold shrink-0">
                                              T{tIdx + 1}
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                              {top.title}
                                            </span>
                                            {top.hasVideo && (
                                              <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                                <Play className="w-2.5 h-2.5 fill-current" /> Recorded Class
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            {top.hasVideo && top.videoUrl && (
                                              <button
                                                onClick={() => setPlayingVideo({ title: top.title, videoUrl: top.videoUrl! })}
                                                className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[10px] flex items-center gap-1 hover:bg-cyan-500/20 transition-colors"
                                                title="Preview Recorded Class Video"
                                              >
                                                <Play className="w-3 h-3 fill-current" />
                                                <span>Play Video</span>
                                              </button>
                                            )}
                                            {!top.hasVideo && (
                                              <button
                                                onClick={() => {
                                                  setQuickTopicVideo({ topicId: top.id, title: top.title });
                                                  setQuickVideoUrl('');
                                                  setQuickDuration(30);
                                                }}
                                                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-cyan-400 dark:hover:text-cyan-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                                                title="Attach Recorded YouTube Session"
                                              >
                                                <Plus className="w-3 h-3" />
                                                <span>Add YouTube</span>
                                              </button>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              ID: {top.id}
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD COURSE MODAL */}
      {/* ========================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Create New Course Track</h3>
              <button onClick={() => setShowCourseModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Advanced Java & Cloud Microservices"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Slug Identifier</label>
                <input
                  type="text"
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="e.g. java-cloud-microservices"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Overview of syllabus, prerequisites, outcomes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubCourse"
                  checked={courseForm.published}
                  onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="pubCourse" className="font-semibold text-slate-700 dark:text-slate-300">
                  Publish course immediately to student catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD SUBJECT MODAL */}
      {/* ========================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add Subject to Course</h3>
              <button onClick={() => setShowSubjectModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Course *</label>
                <select
                  value={subjectForm.courseId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, courseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  placeholder="e.g. Core Java & Object Oriented Design"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD MODULE MODAL */}
      {/* ========================================================= */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add Module under Subject</h3>
              <button onClick={() => setShowModuleModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Subject *</label>
                <select
                  value={moduleForm.subjectId}
                  onChange={(e) => setModuleForm({ ...moduleForm, subjectId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value={0}>Select Subject</option>
                  {courseDetail?.subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Collections Framework & Generics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD TOPIC MODAL */}
      {/* ========================================================= */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Add Topic under Module</h3>
              <button onClick={() => setShowTopicModal(false)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Module *</label>
                <select
                  value={topicForm.moduleId}
                  onChange={(e) => setTopicForm({ ...topicForm, moduleId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value={0}>Select Module</option>
                  {courseDetail?.subjects?.flatMap((s) => s.modules || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  placeholder="e.g. HashMap Internals & Collision Resolution"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Recorded Session / YouTube Video Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recorded Session / YouTube Link (Optional)</span>
                  </label>
                  {topicForm.videoUrl && isYouTubeUrl(topicForm.videoUrl) && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>YouTube Detected</span>
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={topicForm.videoUrl}
                  onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                  placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400">
                  When added here, this YouTube video is automatically attached as the recorded session for this topic.
                </p>

                {/* Live YouTube Preview */}
                {topicForm.videoUrl && isYouTubeUrl(topicForm.videoUrl) && getYouTubeVideoId(topicForm.videoUrl) && (
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                      Live Recorded Session Preview:
                    </span>
                    <div className="rounded-xl overflow-hidden aspect-video bg-black shadow">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(topicForm.videoUrl)}`}
                        title="Recorded Session Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={topicForm.durationMinutes}
                    onChange={(e) => setTopicForm({ ...topicForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={topicForm.orderIndex}
                    onChange={(e) => setTopicForm({ ...topicForm, orderIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lesson Notes & Summary</label>
                <textarea
                  rows={2}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Key concepts, syllabus notes, and lecture summary..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Topic & Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK ATTACH YOUTUBE VIDEO TO EXISTING TOPIC MODAL */}
      {/* ========================================================= */}
      {quickTopicVideo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Attach Recorded Class
                </h3>
              </div>
              <button onClick={() => setQuickTopicVideo(null)} className="p-1 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Target Topic: <strong className="text-slate-900 dark:text-white">{quickTopicVideo.title}</strong>
            </p>

            <form onSubmit={handleQuickAttachVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  YouTube Video Link *
                </label>
                <input
                  type="url"
                  required
                  value={quickVideoUrl}
                  onChange={(e) => setQuickVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-xs"
                />
              </div>

              {quickVideoUrl && isYouTubeUrl(quickVideoUrl) && getYouTubeVideoId(quickVideoUrl) && (
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Preview:
                  </span>
                  <div className="rounded-lg overflow-hidden aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(quickVideoUrl)}`}
                      title="Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickTopicVideo(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Attaching...' : 'Attach Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PLAY RECORDED SESSION VIDEO PREVIEW MODAL */}
      {/* ========================================================= */}
      {playingVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-600 fill-current" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {playingVideo.title}
                </h3>
              </div>
              <button onClick={() => setPlayingVideo(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black w-full">
              <iframe
                src={getEmbedVideoUrl(playingVideo.videoUrl)}
                title={playingVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="font-bold text-red-600 flex items-center gap-1">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Recorded Class (YouTube)</span>
              </span>
              <a
                href={playingVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-400 flex items-center gap-1"
              >
                Open in YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
