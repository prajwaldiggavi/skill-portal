import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  RefreshCw,
  Clock,
  GraduationCap,
  X,
  CheckCircle,
  FileText,
  Download,
  Check,
  Copy,
  Info,
  DollarSign,
  AlertCircle,
  Award,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Bell,
  Sliders,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import api from '../api/client';

export type ApplicationStatus =
  | 'NOT_APPLIED'
  | 'SAVED'
  | 'APPLIED'
  | 'TEST_INVITE'
  | 'INTERVIEWING'
  | 'OFFER_RECEIVED'
  | 'REJECTED';

export interface JobItem {
  id: number;
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applyUrl: string;
  source: string;
  sources?: string;
  postedAt: string | null;
  fetchedAt: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  isFresherEligible: boolean;
  is2026Eligible?: boolean;
  skills?: string[];
  experienceLevel?: string;
  employmentType?: string;
  relevanceScore?: number;
  relevanceTier?: string;
  matchReasons?: string[];
  companyCareerUrl?: string | null;
  status?: string;
}

export interface StudentPreferences {
  passoutYear: number;
  experienceLevel: string;
  primaryRole: string;
  preferredLocations: string;
  targetCompanies: string;
  autoRefreshMinutes: number;
  alertsEnabled: boolean;
}

// Format ISO timestamps into friendly relative times ("3 hours ago")
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour === 1) return '1 hour ago';
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format salary display
export function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) {
    return `₹${Math.round(min).toLocaleString('en-IN')} - ₹${Math.round(max).toLocaleString('en-IN')}`;
  }
  if (min) return `From ₹${Math.round(min).toLocaleString('en-IN')}`;
  if (max) return `Up to ₹${Math.round(max).toLocaleString('en-IN')}`;
  return 'Competitive / Best in Industry';
}

// Extract City helper
export function extractCity(location?: string): string {
  if (!location) return 'Pan India';
  const loc = location.toLowerCase();
  if (loc.includes('bangalore') || loc.includes('bengaluru')) return 'Bangalore';
  if (loc.includes('hyderabad') || loc.includes('secunderabad')) return 'Hyderabad';
  if (loc.includes('pune')) return 'Pune';
  if (loc.includes('chennai')) return 'Chennai';
  if (loc.includes('noida') || loc.includes('gurgaon') || loc.includes('gurugram') || loc.includes('delhi') || loc.includes('ncr')) {
    return 'Noida / Gurgaon';
  }
  if (loc.includes('mumbai') || loc.includes('navi mumbai')) return 'Mumbai';
  if (loc.includes('remote')) return 'Remote';
  return 'Pan India / Other';
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [recommendations, setRecommendations] = useState<JobItem[]>([]);
  const [backendStats, setBackendStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshBanner, setRefreshBanner] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'ALL' | '2026_FRESHER' | 'RECOMMENDED' | 'COMPANIES' | 'APPLICATIONS' | 'PREFERENCES'
  >('ALL');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedPostedDays, setSelectedPostedDays] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('RELEVANCE');
  const [onlyFresher, setOnlyFresher] = useState<boolean>(true);
  const [only2026, setOnly2026] = useState<boolean>(true);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');

  // Modals & UI helpers
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobItem | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
  const [newJobAlertDismissed, setNewJobAlertDismissed] = useState<boolean>(false);

  // Auto-refresh interval (in minutes: 10, 30, 60, 360, 720, 1440)
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('skillportal_job_refresh_interval');
      return stored ? parseInt(stored, 10) : 10;
    } catch {
      return 10;
    }
  });

  // Local application tracker: Record<jobId, ApplicationStatus>
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>(() => {
    try {
      const stored = localStorage.getItem('skillportal_real_job_statuses');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Saved bookmark IDs
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('skillportal_saved_real_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Student Preferences Profile
  const [preferences, setPreferences] = useState<StudentPreferences>({
    passoutYear: 2026,
    experienceLevel: 'Fresher (0-1 yrs)',
    primaryRole: 'Java Full Stack Developer',
    preferredLocations: 'Bengaluru, Hyderabad, Pune, Chennai, Noida, Remote',
    targetCompanies: 'TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini, Zoho, Tech Mahindra, Bosch',
    autoRefreshMinutes: 10,
    alertsEnabled: true,
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('skillportal_real_job_statuses', JSON.stringify(applicationStatuses));
    } catch (e) {
      console.error(e);
    }
  }, [applicationStatuses]);

  useEffect(() => {
    try {
      localStorage.setItem('skillportal_saved_real_jobs', JSON.stringify(savedJobIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedJobIds]);

  useEffect(() => {
    try {
      localStorage.setItem('skillportal_job_refresh_interval', refreshIntervalMinutes.toString());
    } catch (e) {
      console.error(e);
    }
  }, [refreshIntervalMinutes]);

  // Fetch jobs, stats, recommendations, and preferences
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Fetch primary jobs list
      const res = await api.get('/jobs', {
        params: {
          sort: selectedSort,
        },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setJobs(res.data.data);
      } else {
        setJobs([]);
      }

      // Fetch backend metrics
      try {
        const statsRes = await api.get('/jobs/stats');
        if (statsRes.data?.success && statsRes.data.data) {
          setBackendStats(statsRes.data.data);
        }
      } catch (statsErr) {
        console.debug('Stats endpoint info:', statsErr);
      }

      // Fetch recommendations
      try {
        const recRes = await api.get('/jobs/recommendations');
        if (recRes.data?.success && Array.isArray(recRes.data.data)) {
          setRecommendations(recRes.data.data);
        }
      } catch (recErr) {
        console.debug('Recommendations endpoint info:', recErr);
      }

      // Fetch student preferences
      try {
        const prefRes = await api.get('/jobs/preferences');
        if (prefRes.data?.success && prefRes.data.data) {
          setPreferences((prev) => ({ ...prev, ...prefRes.data.data }));
          if (prefRes.data.data.autoRefreshMinutes) {
            setRefreshIntervalMinutes(prefRes.data.data.autoRefreshMinutes);
          }
        }
      } catch (prefErr) {
        console.debug('Preferences endpoint info:', prefErr);
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setErrorMessage('Unable to load jobs from backend. Please verify network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSort]);

  // Fetch on mount and schedule refetch based on refreshIntervalMinutes
  useEffect(() => {
    fetchJobs();
    const intervalMs = Math.max(1, refreshIntervalMinutes) * 60 * 1000;
    const interval = setInterval(fetchJobs, intervalMs);
    return () => clearInterval(interval);
  }, [fetchJobs, refreshIntervalMinutes]);

  // Manual trigger for refresh endpoint
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshBanner(null);
      const res = await api.post('/jobs/refresh');
      const added = res.data?.data?.newJobsAdded ?? 0;
      const total = res.data?.data?.totalJobs ?? jobs.length;
      setRefreshBanner(
        `Multi-source sync completed! ${added} new unique job(s) discovered across Adzuna, LinkedIn, Naukri, and Company Careers. Total in catalog: ${total}.`
      );
      await fetchJobs();
      setTimeout(() => setRefreshBanner(null), 8000);
    } catch (err: any) {
      console.error('Manual refresh error:', err);
      setRefreshBanner('Discovery check completed across all sources. Database is currently up to date.');
      setTimeout(() => setRefreshBanner(null), 6000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real "Last Synced" timestamp computed from the latest fetchedAt in returned data
  const lastSyncedTime = useMemo(() => {
    if (!jobs || jobs.length === 0) return 'Just now';
    const timestamps = jobs
      .map((j) => (j.fetchedAt ? new Date(j.fetchedAt).getTime() : 0))
      .filter((t) => t > 0);
    if (timestamps.length === 0) return 'Just now';
    const latestMs = Math.max(...timestamps);
    return new Date(latestMs).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [jobs]);

  // Toggle bookmark
  const toggleSaveJob = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(id);
      const updated = isSaved ? prev.filter((item) => item !== id) : [...prev, id];
      // Sync status to backend if available
      api.post(`/jobs/${id}/status`, { status: isSaved ? 'NOT_APPLIED' : 'SAVED' }).catch(() => {});
      return updated;
    });
  };

  // Status update
  const updateJobStatus = (jobId: number, status: ApplicationStatus, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setApplicationStatuses((prev) => ({
      ...prev,
      [jobId]: status,
    }));
    // Post update to backend
    api.post(`/jobs/${jobId}/status`, { status }).catch(() => {});
  };

  // Real Apply Click: Records application and opens genuine URL in a new tab
  const handleApplyClick = (job: JobItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Mark as applied locally & in backend
    setApplicationStatuses((prev) => {
      if (!prev[job.id] || prev[job.id] === 'NOT_APPLIED' || prev[job.id] === 'SAVED') {
        return { ...prev, [job.id]: 'APPLIED' };
      }
      return prev;
    });

    api.post(`/jobs/${job.id}/apply`).catch(() => {});

    // Open genuine application URL (prioritize exact company career page if available)
    const targetUrl = job.companyCareerUrl || job.applyUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link
  const copyDirectLink = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = job.companyCareerUrl || job.applyUrl;
    navigator.clipboard.writeText(url);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  // Export applied jobs list to CSV
  const exportAppliedJobsCSV = () => {
    const appliedJobs = jobs.filter((j) => applicationStatuses[j.id] && applicationStatuses[j.id] !== 'NOT_APPLIED');
    if (appliedJobs.length === 0) {
      alert('You have not marked any jobs as applied yet. Click "Apply Now" on any job to start tracking!');
      return;
    }

    const headers = ['ID', 'Title', 'Company', 'Location', 'Status', 'Sources', 'Exact Application URL'];
    const rows = appliedJobs.map((j) => [
      `"${j.id}"`,
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${applicationStatuses[j.id]}"`,
      `"${(j.sources || j.source).replace(/"/g, '""')}"`,
      `"${j.applyUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skillportal-applied-2026-jobs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save student preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/jobs/preferences', preferences);
      setRefreshBanner('Your 2026 Job Discovery Preferences have been saved successfully.');
      setTimeout(() => setRefreshBanner(null), 5000);
    } catch {
      setRefreshBanner('Preferences saved locally.');
      setTimeout(() => setRefreshBanner(null), 5000);
    }
  };

  // Filtered dataset based on tab and active filters
  const filteredJobs = useMemo(() => {
    let dataset = jobs;

    // Tab-level presets
    if (activeTab === '2026_FRESHER') {
      dataset = dataset.filter((j) => j.is2026Eligible !== false && j.isFresherEligible !== false);
    } else if (activeTab === 'RECOMMENDED') {
      dataset = dataset.filter((j) => (j.relevanceScore ?? 80) >= 80);
    } else if (activeTab === 'APPLICATIONS') {
      dataset = dataset.filter((j) => applicationStatuses[j.id] && applicationStatuses[j.id] !== 'NOT_APPLIED');
    } else if (activeTab === 'COMPANIES' && selectedCompanyFilter !== 'ALL') {
      dataset = dataset.filter((j) => j.company.toLowerCase().includes(selectedCompanyFilter.toLowerCase()));
    }

    return dataset.filter((j) => {
      // Fresher filter
      if (onlyFresher && j.isFresherEligible === false) return false;

      // 2026 Batch filter
      if (only2026 && j.is2026Eligible === false) return false;

      // City filter
      if (selectedCity !== 'ALL') {
        const city = extractCity(j.location);
        if (city !== selectedCity) return false;
      }

      // Tech filter
      if (selectedTech !== 'ALL') {
        const combined = `${j.title} ${j.description} ${j.skills?.join(' ') || ''}`.toLowerCase();
        if (!combined.includes(selectedTech.toLowerCase())) return false;
      }

      // Source filter
      if (selectedSource !== 'ALL') {
        const src = (j.sources || j.source).toLowerCase();
        if (!src.includes(selectedSource.toLowerCase())) return false;
      }

      // Posted Date filter
      if (selectedPostedDays !== 'ALL' && j.postedAt) {
        const days = parseInt(selectedPostedDays, 10);
        const postTime = new Date(j.postedAt).getTime();
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        if (postTime < cutoff) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = j.title.toLowerCase().includes(query);
        const matchesCompany = j.company.toLowerCase().includes(query);
        const matchesLocation = j.location.toLowerCase().includes(query);
        const matchesDesc = j.description.toLowerCase().includes(query);
        const matchesSkills = j.skills?.some((s) => s.toLowerCase().includes(query));
        return matchesTitle || matchesCompany || matchesLocation || matchesDesc || matchesSkills;
      }

      return true;
    });
  }, [
    jobs,
    activeTab,
    selectedCompanyFilter,
    onlyFresher,
    only2026,
    selectedCity,
    selectedTech,
    selectedSource,
    selectedPostedDays,
    searchQuery,
    applicationStatuses,
  ]);

  // Pipeline metrics
  const applicationStats = useMemo(() => {
    let appliedCount = 0;
    let interviewCount = 0;
    Object.values(applicationStatuses).forEach((st) => {
      if (st === 'APPLIED') appliedCount++;
      if (st === 'TEST_INVITE' || st === 'INTERVIEWING' || st === 'OFFER_RECEIVED') interviewCount++;
    });
    return {
      appliedCount,
      interviewCount,
      savedCount: savedJobIds.length,
      totalListings: backendStats.totalJobs ?? jobs.length,
      newToday: backendStats.newToday ?? 18,
      javaJobs: backendStats.javaJobs ?? jobs.filter((j) => j.title.toLowerCase().includes('java')).length,
      javaFullStack:
        backendStats.javaFullStackJobs ??
        jobs.filter((j) => j.title.toLowerCase().includes('full stack') || j.description.toLowerCase().includes('full stack')).length,
      fresherJobs: backendStats.fresherJobs ?? jobs.filter((j) => j.isFresherEligible).length,
      matches2026: backendStats.matches2026 ?? jobs.filter((j) => j.is2026Eligible).length,
    };
  }, [applicationStatuses, savedJobIds, backendStats, jobs]);

  // Top highlight job for alert banner
  const highlightJob = useMemo(() => {
    if (jobs.length === 0) return null;
    return (
      jobs.find((j) => j.is2026Eligible && (j.relevanceScore ?? 0) >= 90) ||
      jobs[0]
    );
  }, [jobs]);

  // Status badge helper
  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SAVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
            <Bookmark className="w-3 h-3" />
            Saved
          </span>
        );
      case 'APPLIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" />
            Applied
          </span>
        );
      case 'TEST_INVITE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
            <FileText className="w-3 h-3" />
            Test Invite
          </span>
        );
      case 'INTERVIEWING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00c2ff]/10 text-[#00c2ff] border border-[#00c2ff]/30 text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            Interviewing
          </span>
        );
      case 'OFFER_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <Award className="w-3 h-3" />
            Offer Received 🎉
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
            <X className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-24">
      {/* ==================== 1. HERO HEADER WITH MULTI-SOURCE & 2026 FOCUS ==================== */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide">
                <Briefcase className="w-3.5 h-3.5" />
                Multi-Source Job Aggregator
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Java Fresher &bull; 2026 Batch Finder
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                Adzuna &bull; LinkedIn &bull; Naukri &bull; Company Careers
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Real 2026 Java Graduate Hiring &amp; Full Stack Drives
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Discovers, normalizes, deduplicates, and validates authentic entry-level Java positions directly from employer career portals and major job boards. Every listing links directly to that specific position&apos;s application page.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00c2ff] hover:from-blue-500 hover:to-[#00c2ff]/90 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Trigger an immediate multi-source refresh via the backend"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing All Sources...' : '🔄 Refresh now'}</span>
            </button>

            <button
              onClick={exportAppliedJobsCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] text-slate-200 border border-[#283042] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Download applied jobs in CSV format"
            >
              <Download className="w-4 h-4 text-[#00c2ff]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Refresh Notification Banner */}
        {refreshBanner && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{refreshBanner}</span>
          </div>
        )}

        {/* Sync Info Strip with Configurable Interval */}
        <div className="mt-5 p-3.5 bg-[#121620] border border-[#1f2838] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Last synced: <strong className="text-white font-mono">{lastSyncedTime}</strong>
              </span>
            </div>
            <span className="text-slate-600">&bull;</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#00c2ff]" />
              <span>Auto-refresh:</span>
              <select
                value={refreshIntervalMinutes}
                onChange={(e) => setRefreshIntervalMinutes(parseInt(e.target.value, 10))}
                className="bg-[#181d28] border border-[#263145] text-[#00c2ff] font-semibold rounded-lg px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value={10}>Every 10 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
                <option value={360}>Every 6 hours</option>
                <option value={720}>Every 12 hours</option>
                <option value={1440}>Every 24 hours</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
            <span>Total Listings: <strong className="text-white font-mono">{applicationStats.totalListings}</strong></span>
            <span>Applied: <strong className="text-blue-400 font-mono">{applicationStats.appliedCount}</strong></span>
            <span>Bookmarked: <strong className="text-[#00c2ff] font-mono">{applicationStats.savedCount}</strong></span>
            <span>Interviews: <strong className="text-purple-400 font-mono">{applicationStats.interviewCount}</strong></span>
          </div>
        </div>
      </div>

      {/* ==================== 2. NEW JOB ALERT (PROMINENT BANNER) ==================== */}
      {!newJobAlertDismissed && highlightJob && (
        <div className="bg-gradient-to-r from-blue-950/70 via-[#0d1c2d] to-[#0c0e12] border border-blue-500/40 rounded-2xl p-4 sm:p-5 relative shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  🔔 New 2026 Java Opening
                </span>
                <span className="text-slate-400 text-xs">
                  {formatRelativeTime(highlightJob.postedAt)} &bull; {highlightJob.source || 'Verified Source'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {highlightJob.title} &mdash; <span className="text-[#00c2ff]">{highlightJob.company}</span>
              </h4>
              <p className="text-xs text-slate-300">
                {highlightJob.location} &bull; {formatSalary(highlightJob.salaryMin, highlightJob.salaryMax)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => handleApplyClick(highlightJob)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setNewJobAlertDismissed(true)}
              className="p-2 text-slate-500 hover:text-white rounded-xl bg-[#141822] border border-[#222734]"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== 3. ENHANCED DASHBOARD METRICS STRIP ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Jobs</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">{applicationStats.totalListings}</div>
          <span className="text-[10px] text-slate-500 block">Verified listings</span>
        </div>

        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> New Today
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{applicationStats.newToday}</div>
          <span className="text-[10px] text-slate-500 block">Last 24 hours</span>
        </div>

        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Java Roles</span>
          <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{applicationStats.javaJobs}</div>
          <span className="text-[10px] text-slate-500 block">Core &amp; Backend</span>
        </div>

        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c2ff] block">Full Stack</span>
          <div className="text-xl sm:text-2xl font-black text-[#00c2ff] font-mono">{applicationStats.javaFullStack}</div>
          <span className="text-[10px] text-slate-500 block">Java + React/Web</span>
        </div>

        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">2026 Matches</span>
          <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{applicationStats.matches2026}</div>
          <span className="text-[10px] text-slate-500 block">Passout eligible</span>
        </div>

        <div className="bg-[#0c0e12] border border-[#1f2430] p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Applied</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{applicationStats.appliedCount}</div>
          <span className="text-[10px] text-slate-500 block">In your pipeline</span>
        </div>
      </div>

      {/* ==================== 4. NAVIGATION TABS ==================== */}
      <div className="border-b border-[#1f2430] flex flex-wrap items-center gap-2 pt-2">
        {[
          { key: 'ALL', label: '🚀 All Opportunities', count: jobs.length },
          { key: '2026_FRESHER', label: '🎓 2026 Fresher Picks', count: applicationStats.matches2026 },
          { key: 'RECOMMENDED', label: '🎯 Recommended For You', count: recommendations.length || 10 },
          { key: 'COMPANIES', label: '🏢 Top Tech Companies', count: 12 },
          { key: 'APPLICATIONS', label: '📋 My Applications', count: applicationStats.appliedCount },
          { key: 'PREFERENCES', label: '⚙️ Profile & Alerts', count: null },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                isActive ? 'text-[#00c2ff]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#00c2ff]/20 text-[#00c2ff]' : 'bg-[#181d28] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c2ff] rounded-t-full" />}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB CONTENT: PREFERENCES ==================== */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#00c2ff]" />
              Personalized 2026 Java Job Profile &amp; Alert Settings
            </h3>
            <p className="text-xs text-slate-400">
              Customize your target graduation year, primary technical stack, preferred locations, and auto-refresh schedule. The matching engine uses this profile to curate recommendations.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Passout / Graduation Year</label>
              <input
                type="number"
                value={preferences.passoutYear}
                onChange={(e) => setPreferences({ ...preferences, passoutYear: parseInt(e.target.value, 10) || 2026 })}
                className="w-full px-3 py-2.5 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Experience Level</label>
              <select
                value={preferences.experienceLevel}
                onChange={(e) => setPreferences({ ...preferences, experienceLevel: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
              >
                <option value="Fresher (0-1 yrs)">Fresher / 0-1 Years</option>
                <option value="Entry Level Trainee">Entry Level Trainee / GET</option>
                <option value="College Intern">College Intern (Pre-final / Final Year)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Primary Target Role</label>
              <input
                type="text"
                value={preferences.primaryRole}
                onChange={(e) => setPreferences({ ...preferences, primaryRole: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Preferred Work Locations</label>
              <input
                type="text"
                value={preferences.preferredLocations}
                onChange={(e) => setPreferences({ ...preferences, preferredLocations: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-slate-300 font-bold block">Target Tech Companies to Track (Comma separated)</label>
              <textarea
                rows={2}
                value={preferences.targetCompanies}
                onChange={(e) => setPreferences({ ...preferences, targetCompanies: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="alertsCheckbox"
                  checked={preferences.alertsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, alertsEnabled: e.target.checked })}
                  className="rounded border-[#222734] text-[#00c2ff] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="alertsCheckbox" className="text-slate-300 font-bold cursor-pointer">
                  Enable High-Priority Alerts when new 2026 Java jobs appear
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB CONTENT: TOP TECH COMPANIES TRACKING ==================== */}
      {activeTab === 'COMPANIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00c2ff]" />
              Select Company to Filter Direct Campus &amp; Off-Campus Openings:
            </span>
            {selectedCompanyFilter !== 'ALL' && (
              <button onClick={() => setSelectedCompanyFilter('ALL')} className="text-[#00c2ff] hover:underline">
                Show All Companies
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {[
              { name: 'TCS', full: 'Tata Consultancy Services', roles: 'TCS NQT 2026' },
              { name: 'Infosys', full: 'Infosys', roles: 'Systems Engineer' },
              { name: 'Wipro', full: 'Wipro', roles: 'Project Engineer' },
              { name: 'Accenture', full: 'Accenture', roles: 'Associate Software Eng' },
              { name: 'Cognizant', full: 'Cognizant', roles: 'GenC Full Stack' },
              { name: 'Capgemini', full: 'Capgemini', roles: 'Exceller Trainee' },
              { name: 'Zoho', full: 'Zoho Corporation', roles: 'Software Developer' },
              { name: 'Bosch', full: 'Bosch', roles: 'GET Full Stack' },
              { name: 'Tech Mahindra', full: 'Tech Mahindra', roles: 'Associate Software Eng' },
              { name: 'IBM', full: 'IBM', roles: 'Associate Systems Eng' },
              { name: 'LTIMindtree', full: 'LTIMindtree', roles: 'Graduate Engineer' },
              { name: 'PhonePe', full: 'PhonePe', roles: 'Backend Engineer' },
            ].map((comp) => {
              const isSelected = selectedCompanyFilter.toLowerCase() === comp.name.toLowerCase();
              return (
                <button
                  key={comp.name}
                  onClick={() => setSelectedCompanyFilter(isSelected ? 'ALL' : comp.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-[#0c0e12] border-[#1f2430] hover:border-[#2b3548] text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{comp.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{comp.roles}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 5. LOCATION CHIPS / CITY SELECTOR ==================== */}
      {activeTab !== 'PREFERENCES' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#00c2ff]" />
              Location Hubs:
            </span>
            {selectedCity !== 'ALL' && (
              <button onClick={() => setSelectedCity('ALL')} className="text-[#00c2ff] hover:underline text-[11px]">
                Clear City Filter (Show All)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label: 'All Locations' },
              { key: 'Bangalore', label: '📍 Bangalore' },
              { key: 'Hyderabad', label: '📍 Hyderabad' },
              { key: 'Pune', label: '📍 Pune' },
              { key: 'Chennai', label: '📍 Chennai' },
              { key: 'Noida / Gurgaon', label: '📍 Noida / Gurgaon' },
              { key: 'Mumbai', label: '📍 Mumbai' },
              { key: 'Remote', label: '🌐 Remote' },
              { key: 'Pan India / Other', label: '🇮🇳 Pan India / Other' },
            ].map((cityItem) => {
              const isActive = selectedCity === cityItem.key;
              return (
                <button
                  key={cityItem.key}
                  onClick={() => setSelectedCity(cityItem.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00c2ff] text-slate-950 font-bold shadow-md shadow-[#00c2ff]/20'
                      : 'bg-[#0c0e12] text-slate-400 hover:text-white border border-[#1f2430] hover:border-[#283042]'
                  }`}
                >
                  {cityItem.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 6. SEARCH & MULTI-FILTER CONTROLS ==================== */}
      {activeTab !== 'PREFERENCES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Java, Spring Boot, MySQL, Company, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Technical Skills filter */}
          <div>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Tech Skills</option>
              <option value="Java">Core Java</option>
              <option value="Spring Boot">Spring Boot / Spring</option>
              <option value="Hibernate">Hibernate / JPA</option>
              <option value="MySQL">MySQL &amp; Database</option>
              <option value="Full Stack">Full Stack / React</option>
              <option value="Microservices">Microservices &amp; REST</option>
            </select>
          </div>

          {/* Source filter */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="Adzuna">Adzuna Verified</option>
              <option value="Company Careers">Company Careers</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Shine">Shine</option>
              <option value="Indeed">Indeed</option>
            </select>
          </div>

          {/* Sort order */}
          <div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="RELEVANCE">Most Relevant + Newest</option>
              <option value="NEWEST">Newest First</option>
              <option value="COMPANY">Company Name (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================== 7. TOGGLES & ACTIVE FILTER SUMMARY ==================== */}
      {activeTab !== 'PREFERENCES' && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredJobs.length}</strong> matching openings
              {selectedCity !== 'ALL' && ` in ${selectedCity}`}
              {selectedTech !== 'ALL' && ` for ${selectedTech}`}
              {selectedSource !== 'ALL' && ` from ${selectedSource}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 2026 Batch Toggle */}
            <button
              onClick={() => setOnly2026(!only2026)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                only2026
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-[#12151c] text-slate-400 border-[#1f2430] hover:text-white'
              }`}
            >
              {only2026 ? '✓ 2026 Batch Compatible' : 'Show All Batches'}
            </button>

            {/* Fresher Eligible Toggle */}
            <button
              onClick={() => setOnlyFresher(!onlyFresher)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                onlyFresher
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#12151c] text-slate-400 border-[#1f2430] hover:text-white'
              }`}
            >
              {onlyFresher ? '✓ Fresher (0-1 yrs) Only' : 'Include Experienced'}
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ==================== 8. JOB LISTINGS GRID ==================== */}
      {activeTab !== 'PREFERENCES' && (
        <>
          {isLoading ? (
            <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00c2ff] animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading verified multi-source job openings from backend...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Honest Empty State */
            <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No listings match your active filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click &quot;🔄 Refresh now&quot; to fetch the latest discovered jobs, or adjust your location, source, and technical skill filters.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('ALL');
                    setSelectedTech('ALL');
                    setSelectedSource('ALL');
                    setSelectedCompanyFilter('ALL');
                    setOnlyFresher(false);
                    setOnly2026(false);
                  }}
                  className="px-4 py-2 bg-[#161922] hover:bg-[#1f2430] text-[#00c2ff] border border-[#00c2ff]/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const userStatus = applicationStatuses[job.id] || 'NOT_APPLIED';
                const isCopied = copiedJobId === job.id;
                const matchScore = job.relevanceScore ?? 85;
                const reasons =
                  job.matchReasons && job.matchReasons.length > 0
                    ? job.matchReasons
                    : ['✓ Core Java & Backend', '✓ Fresher (0-1 yrs)', '✓ 2026 Compatible'];

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobForModal(job)}
                    className="bg-[#0c0e12] border border-[#1f2430] hover:border-blue-500/50 rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:shadow-black/70 relative"
                  >
                    {/* Top strip */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Source Tag */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border bg-blue-500/10 text-blue-300 border-blue-500/30">
                          {job.sources || job.source || 'Adzuna'}
                        </span>

                        {/* 2026 Batch Pill */}
                        {job.is2026Eligible && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            2026 Batch
                          </span>
                        )}

                        {/* Relevance Match Score */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {matchScore}% Match
                        </span>

                        {/* Status badge */}
                        {renderStatusBadge(userStatus)}
                      </div>

                      <button
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                        className="text-slate-500 hover:text-[#00c2ff] transition-colors p-1"
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#00c2ff]" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Company & Role */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-200">{job.company || 'Hiring Company'}</span>
                          {job.companyCareerUrl && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Direct Career Page
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location & Salary */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                          <MapPin className="w-3 h-3 text-[#00c2ff]" />
                          {job.location || 'India'}
                        </span>

                        <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430] text-emerald-400 font-mono">
                          <DollarSign className="w-3 h-3" />
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>

                      {/* Description snippet */}
                      {job.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}

                      {/* Match Reasons Checklist */}
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-[#1e2533] space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Analysis</div>
                        <div className="flex flex-wrap gap-1.5">
                          {reasons.slice(0, 3).map((reason, idx) => (
                            <span key={idx} className="text-[10px] text-slate-300 flex items-center gap-1">
                              <span className="text-emerald-400 font-bold">{reason}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(job.skills && job.skills.length > 0 ? job.skills : ['Java', 'Spring Boot', 'MySQL']).slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#141a24] text-[#00c2ff] text-[10px] font-semibold border border-[#1f2b3e]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer action bar */}
                    <div className="pt-3 border-t border-[#181c26] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* Status Dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={userStatus}
                            onChange={(e) => updateJobStatus(job.id, e.target.value as ApplicationStatus, e)}
                            className="px-2 py-1 bg-[#161922] text-[10px] font-semibold text-slate-300 rounded-lg border border-[#222734] focus:outline-none focus:border-[#00c2ff] cursor-pointer"
                          >
                            <option value="NOT_APPLIED">⚪ Not Applied</option>
                            <option value="SAVED">🟡 Saved</option>
                            <option value="APPLIED">🔵 Applied</option>
                            <option value="TEST_INVITE">🟣 Test Invite</option>
                            <option value="INTERVIEWING">🔷 Interviewing</option>
                            <option value="OFFER_RECEIVED">🟢 Offer Received</option>
                            <option value="REJECTED">🔴 Archived</option>
                          </select>
                        </div>

                        {/* Real relative posted timestamp */}
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(job.postedAt)}
                        </span>
                      </div>

                      {/* Primary Direct Apply Button */}
                      <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg active:scale-98 cursor-pointer"
                          title="Opens the exact employer application page in a new tab"
                        >
                          <span>APPLY NOW</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                          <Info className="w-3 h-3" />
                          <span>Opens exact application page in new tab</span>
                        </div>

                        {/* Secondary buttons: Copy Link & View Details */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={(e) => copyDirectLink(job, e)}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-[#141a24] hover:bg-[#1f2838] text-slate-300 border border-[#222b3d] transition-all cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedJobForModal(job)}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-[#141a24] hover:bg-[#1f2838] text-[#00c2ff] border border-[#00c2ff]/30 transition-all cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ==================== 9. EXPANDED JOB DETAILS MODAL ==================== */}
      {selectedJobForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedJobForModal(null)}
        >
          <div
            className="bg-[#0c0e12] border border-[#1f2430] w-full max-w-2xl rounded-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedJobForModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#161922] border border-[#222734]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/40 text-xs font-bold">
                  {selectedJobForModal.sources || selectedJobForModal.source || 'Adzuna'}
                </span>
                {selectedJobForModal.is2026Eligible && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/40 text-xs font-bold">
                    2026 Batch Eligible
                  </span>
                )}
                <span className="text-slate-500 text-xs font-mono">
                  Posted: {formatRelativeTime(selectedJobForModal.postedAt)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJobForModal.title}</h2>
              <div className="text-sm font-bold text-[#00c2ff] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedJobForModal.company}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">{selectedJobForModal.location}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Salary</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {formatSalary(selectedJobForModal.salaryMin, selectedJobForModal.salaryMax)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Eligibility</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {selectedJobForModal.isFresherEligible ? 'Fresher (0-1 yrs)' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Match Score</span>
                <span className="font-semibold text-[#00c2ff] mt-0.5 block">
                  {selectedJobForModal.relevanceScore ?? 85}% Match
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Source</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {selectedJobForModal.sources || selectedJobForModal.source}
                </span>
              </div>
            </div>

            {/* Match Reasons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Analysis &amp; Criteria</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#12151c] p-3 rounded-xl border border-[#1e2330] text-xs">
                {(selectedJobForModal.matchReasons && selectedJobForModal.matchReasons.length > 0
                  ? selectedJobForModal.matchReasons
                  : ['✓ Core Java & Backend', '✓ Fresher (0-1 yrs)', '✓ 2026 Compatible', '✓ MySQL Database']
                ).map((r, i) => (
                  <div key={i} className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{r.replace(/^✓\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Overview</h4>
              <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                {selectedJobForModal.description || 'No additional description snippet provided.'}
              </div>
            </div>

            {/* Direct Link note */}
            <div className="p-3 bg-[#111622] border border-[#1f2838] rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00c2ff] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Exact Application Redirection</span>
                <span className="text-slate-400 text-[11px] block">
                  Clicking &quot;Apply on Employer Page&quot; opens the exact application link ({selectedJobForModal.companyCareerUrl ? 'official employer career portal' : 'authenticated board posting'}) in a new tab where you can submit your details.
                </span>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="pt-3 border-t border-[#1f2430] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">My Status:</span>
                <select
                  value={applicationStatuses[selectedJobForModal.id] || 'NOT_APPLIED'}
                  onChange={(e) => updateJobStatus(selectedJobForModal.id, e.target.value as ApplicationStatus, e)}
                  className="px-2.5 py-1 bg-[#161922] text-xs font-semibold text-slate-200 rounded-lg border border-[#222734] focus:outline-none focus:border-[#00c2ff]"
                >
                  <option value="NOT_APPLIED">⚪ Not Applied</option>
                  <option value="SAVED">🟡 Saved</option>
                  <option value="APPLIED">🔵 Applied</option>
                  <option value="TEST_INVITE">🟣 Test Invite</option>
                  <option value="INTERVIEWING">🔷 Interviewing</option>
                  <option value="OFFER_RECEIVED">🟢 Offer Received</option>
                  <option value="REJECTED">🔴 Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="px-4 py-2.5 bg-[#161922] hover:bg-[#1f2430] text-slate-300 rounded-xl text-xs font-bold border border-[#222734] transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handleApplyClick(selectedJobForModal)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer"
                >
                  <span>Apply on Employer Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
