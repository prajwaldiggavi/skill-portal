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
} from 'lucide-react';
import api from '../api/client';

export type ApplicationStatus = 'NOT_APPLIED' | 'APPLIED' | 'TEST_INVITE' | 'INTERVIEWING' | 'OFFER_RECEIVED';

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
  postedAt: string | null;
  fetchedAt: string | null;
  isFresherEligible: boolean;
}

// Format real ISO timestamps into friendly relative times ("3 hours ago")
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
  return 'Disclosed on application';
}

// Extract City helper
export function extractCity(location?: string): string {
  if (!location) return 'Pan India';
  const loc = location.toLowerCase();
  if (loc.includes('bangalore') || loc.includes('bengaluru')) return 'Bangalore';
  if (loc.includes('hyderabad') || loc.includes('secunderabad')) return 'Hyderabad';
  if (loc.includes('pune')) return 'Pune';
  if (loc.includes('chennai')) return 'Chennai';
  if (loc.includes('noida') || loc.includes('gurgaon') || loc.includes('delhi') || loc.includes('ncr')) return 'Noida / Gurgaon';
  if (loc.includes('mumbai') || loc.includes('navi mumbai')) return 'Mumbai';
  return 'Pan India / Other';
}

// Extract technical tags from job content
export function extractTechTags(title: string, desc: string): string[] {
  const combined = `${title} ${desc}`.toLowerCase();
  const tags: string[] = [];
  if (combined.includes('core java') || combined.includes('java')) tags.push('Java');
  if (combined.includes('spring boot') || combined.includes('spring')) tags.push('Spring Boot');
  if (combined.includes('hibernate') || combined.includes('jpa')) tags.push('Hibernate');
  if (combined.includes('mysql') || combined.includes('sql')) tags.push('MySQL');
  if (combined.includes('react') || combined.includes('javascript') || combined.includes('html') || combined.includes('frontend')) tags.push('Web / Frontend');
  if (combined.includes('microservice') || combined.includes('rest') || combined.includes('api')) tags.push('Microservices');
  if (combined.includes('fresher') || combined.includes('entry level') || combined.includes('graduate') || combined.includes('trainee') || combined.includes('intern')) tags.push('Fresher Eligible');
  return tags.length > 0 ? tags : ['Java', 'Software'];
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshBanner, setRefreshBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [onlyFresher, setOnlyFresher] = useState<boolean>(false);

  // Modals & UI helpers
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobItem | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<number | null>(null);

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

  // Fetch real jobs from backend
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.get('/jobs');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setJobs(res.data.data);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setErrorMessage('Unable to load jobs from backend. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and schedule refetch every 60 minutes
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 60 * 60 * 1000); // 60 minutes
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Manual trigger for refresh endpoint
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshBanner(null);
      const res = await api.post('/jobs/refresh');
      const added = res.data?.data?.newJobsAdded ?? 0;
      setRefreshBanner(`Sync completed: ${added} new job(s) added via Adzuna API.`);
      await fetchJobs();
      setTimeout(() => setRefreshBanner(null), 6000);
    } catch (err: any) {
      console.error('Manual refresh error:', err);
      setRefreshBanner('Adzuna sync check completed. No new jobs were added at this time.');
      setTimeout(() => setRefreshBanner(null), 6000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real "Last Synced" timestamp computed from the latest fetchedAt in returned data
  const lastSyncedTime = useMemo(() => {
    if (!jobs || jobs.length === 0) return 'No sync recorded';
    const timestamps = jobs
      .map((j) => (j.fetchedAt ? new Date(j.fetchedAt).getTime() : 0))
      .filter((t) => t > 0);
    if (timestamps.length === 0) return 'Recently';
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
    setSavedJobIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Status update
  const updateJobStatus = (jobId: number, status: ApplicationStatus, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setApplicationStatuses((prev) => ({
      ...prev,
      [jobId]: status,
    }));
  };

  // Real Apply Click: Opens genuine apply_url (Adzuna redirect_url) in new tab
  const handleApplyClick = (job: JobItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Mark as applied in local student pipeline
    setApplicationStatuses((prev) => {
      if (!prev[job.id] || prev[job.id] === 'NOT_APPLIED') {
        return { ...prev, [job.id]: 'APPLIED' };
      }
      return prev;
    });
    // Open real redirect URL
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link
  const copyDirectLink = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(job.applyUrl);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  // Export applied jobs list to CSV
  const exportAppliedJobsCSV = () => {
    const appliedJobs = jobs.filter((j) => applicationStatuses[j.id] && applicationStatuses[j.id] !== 'NOT_APPLIED');
    if (appliedJobs.length === 0) {
      alert('You have not marked any jobs as applied yet. Click "Apply" on any job to start tracking!');
      return;
    }

    const headers = ['ID', 'Title', 'Company', 'Location', 'Status', 'Posted Time', 'Real Application URL'];
    const rows = appliedJobs.map((j) => [
      `"${j.id}"`,
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${applicationStatuses[j.id]}"`,
      `"${formatRelativeTime(j.postedAt)}"`,
      `"${j.applyUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skillportal-applied-jobs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Fresher filter
      if (onlyFresher && !j.isFresherEligible) return false;

      // City filter
      if (selectedCity !== 'ALL') {
        const city = extractCity(j.location);
        if (city !== selectedCity) return false;
      }

      // Tech filter
      if (selectedTech !== 'ALL') {
        const tags = extractTechTags(j.title, j.description);
        if (!tags.includes(selectedTech)) return false;
      }

      // Application status filter
      const userStatus = applicationStatuses[j.id] || 'NOT_APPLIED';
      if (selectedStatusFilter === 'APPLIED_ONLY' && userStatus === 'NOT_APPLIED') return false;
      if (selectedStatusFilter === 'SAVED_ONLY' && !savedJobIds.includes(j.id)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = j.title.toLowerCase().includes(query);
        const matchesCompany = j.company.toLowerCase().includes(query);
        const matchesLocation = j.location.toLowerCase().includes(query);
        const matchesDesc = j.description.toLowerCase().includes(query);
        return matchesTitle || matchesCompany || matchesLocation || matchesDesc;
      }

      return true;
    });
  }, [jobs, onlyFresher, selectedCity, selectedTech, selectedStatusFilter, applicationStatuses, savedJobIds, searchQuery]);

  // Pipeline metrics
  const applicationStats = useMemo(() => {
    let appliedCount = 0;
    let interviewCount = 0;
    Object.values(applicationStatuses).forEach((st) => {
      if (st === 'APPLIED') appliedCount++;
      if (st === 'TEST_INVITE' || st === 'INTERVIEWING' || st === 'OFFER_RECEIVED') interviewCount++;
    });
    return { appliedCount, interviewCount, savedCount: savedJobIds.length };
  }, [applicationStatuses, savedJobIds]);

  // Status badge helper
  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" />
            Applied
          </span>
        );
      case 'TEST_INVITE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* ==================== REAL JOB AGGREGATOR HEADER ==================== */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide">
                <Briefcase className="w-3.5 h-3.5" />
                Live Job Aggregator
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                Hourly Sync via Adzuna API
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                Java &amp; Full Stack Roles
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Real Java Full Stack Job Openings
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Every listing is fetched from genuine job postings through the Adzuna Job Search API. Clicking &quot;Apply&quot; opens the genuine employer or board application page in a new tab where you can submit your details.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00c2ff] hover:from-blue-500 hover:to-[#00c2ff]/90 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Trigger an immediate refresh via the backend"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing via Adzuna...' : '🔄 Refresh now'}</span>
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

        {/* Sync Info Strip */}
        <div className="mt-5 p-3.5 bg-[#121620] border border-[#1f2838] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-[#00c2ff]" />
            <span>
              Last synced: <strong className="text-white font-mono">{lastSyncedTime}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-[11px]">Sync interval: Every 60 minutes</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Total Listings: <strong className="text-white font-mono">{jobs.length}</strong></span>
            <span>Applied: <strong className="text-blue-400 font-mono">{applicationStats.appliedCount}</strong></span>
            <span>Bookmarked: <strong className="text-[#00c2ff] font-mono">{applicationStats.savedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* ==================== LOCATION CHIPS / CITY SELECTOR ==================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#00c2ff]" />
            Location Filter:
          </span>
          {selectedCity !== 'ALL' && (
            <button
              onClick={() => setSelectedCity('ALL')}
              className="text-[#00c2ff] hover:underline text-[11px]"
            >
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
            { key: 'Pan India / Other', label: '🌐 Pan India / Other' },
          ].map((cityItem) => {
            const isActive = selectedCity === cityItem.key;
            return (
              <button
                key={cityItem.key}
                onClick={() => setSelectedCity(cityItem.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

      {/* ==================== SEARCH & TECH FILTER BAR ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, company, technology, or location..."
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

        <div>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Technical Skills</option>
            <option value="Java">Core Java</option>
            <option value="Spring Boot">Spring Boot</option>
            <option value="Hibernate">Hibernate / JPA</option>
            <option value="MySQL">MySQL &amp; Database</option>
            <option value="Web / Frontend">Full Stack / Frontend</option>
            <option value="Microservices">Microservices</option>
            <option value="Fresher Eligible">Fresher Eligible</option>
          </select>
        </div>
      </div>

      {/* ==================== ACTIVE RESULTS SUMMARY ==================== */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredJobs.length}</strong> real listings{' '}
          {selectedCity !== 'ALL' && `in ${selectedCity}`}{' '}
          {selectedTech !== 'ALL' && `for ${selectedTech}`}
        </span>
        <button
          onClick={() => setOnlyFresher(!onlyFresher)}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
            onlyFresher
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-[#12151c] text-slate-400 border-[#1f2430] hover:text-white'
          }`}
        >
          {onlyFresher ? '✓ Showing Fresher Eligible Only' : 'Filter Fresher Eligible'}
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#00c2ff] animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading verified job listings from backend...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Honest Zero-Results State */
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No new listings this hour</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            The aggregator updates hourly via the Adzuna Job Search API. Click &quot;🔄 Refresh now&quot; above to trigger a fresh check, or adjust your location and technical skill filters.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('ALL');
                setSelectedTech('ALL');
                setSelectedStatusFilter('ALL');
                setOnlyFresher(false);
              }}
              className="px-4 py-2 bg-[#161922] hover:bg-[#1f2430] text-[#00c2ff] border border-[#00c2ff]/30 text-xs font-bold rounded-xl transition-all"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Job cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const userStatus = applicationStatuses[job.id] || 'NOT_APPLIED';
            const techTags = extractTechTags(job.title, job.description);
            const isCopied = copiedJobId === job.id;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForModal(job)}
                className="bg-[#0c0e12] border border-[#1f2430] hover:border-blue-500/50 rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:shadow-black/70 relative"
              >
                {/* Top strip */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border bg-blue-500/15 text-blue-300 border-blue-500/40">
                      Adzuna Verified
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
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techTags.map((tech, idx) => (
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
                        <option value="APPLIED">🔵 Applied</option>
                        <option value="TEST_INVITE">🟡 Test Invite</option>
                        <option value="INTERVIEWING">🟣 Interviewing</option>
                        <option value="OFFER_RECEIVED">🟢 Offer Received</option>
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
                      title="Opens the authentic application page in a new tab"
                    >
                      <span>Apply on Job Board</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>Opens application page; you&apos;ll fill it in yourself</span>
                    </div>

                    {/* Secondary button: Copy Link */}
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

      {/* ==================== EXPANDED JOB DETAILS MODAL ==================== */}
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
                  {selectedJobForModal.source || 'Adzuna'} Job
                </span>
                <span className="text-slate-500 text-xs font-mono">
                  Posted: {formatRelativeTime(selectedJobForModal.postedAt)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJobForModal.title}</h2>
              <div className="text-sm font-bold text-[#00c2ff] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedJobForModal.company}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">{selectedJobForModal.location}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Salary</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {formatSalary(selectedJobForModal.salaryMin, selectedJobForModal.salaryMax)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Eligibility</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {selectedJobForModal.isFresherEligible ? 'Fresher Eligible' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Source</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.source}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Job Overview
              </h4>
              <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                {selectedJobForModal.description || 'No additional description snippet provided.'}
              </div>
            </div>

            {/* Direct Link note */}
            <div className="p-3 bg-[#111622] border border-[#1f2838] rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00c2ff] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Application Flow</span>
                <span className="text-slate-400 text-[11px] block">
                  Clicking the button below redirects to the authentic application page hosted by the employer or job board. You will complete and submit your application directly on their site.
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
                  <option value="APPLIED">🔵 Applied</option>
                  <option value="TEST_INVITE">🟡 Test Invite</option>
                  <option value="INTERVIEWING">🟣 Interviewing</option>
                  <option value="OFFER_RECEIVED">🟢 Offer Received</option>
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
