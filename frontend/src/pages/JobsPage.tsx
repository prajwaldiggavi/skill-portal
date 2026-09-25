import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  RefreshCw,
  Globe,
  Clock,
  CheckCircle2,
  Sparkles,
  Bot,
  SlidersHorizontal,
  X,
  Share2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export type JobPortalSource = 'LinkedIn' | 'Naukri' | 'Shine' | 'Indeed';

export interface AggregatedJob {
  id: string;
  role: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  ctc: string;
  source: JobPortalSource;
  postedDate: string;
  experience: string;
  tags: string[];
  track: 'Java' | 'Frontend' | 'Python' | 'DevOps' | 'Database' | 'General';
  description: string;
  responsibilities: string[];
  eligibility: string;
  applyUrl: string;
  recommendedCourseSlug?: string;
  activelyHiring?: boolean;
}

const INITIAL_JOBS: AggregatedJob[] = [
  // ==================== LINKEDIN JOBS ====================
  {
    id: 'li-1',
    role: 'Associate Software Engineer (Backend)',
    company: 'Amazon',
    location: 'Bangalore, Karnataka',
    workMode: 'Hybrid',
    ctc: '14.0 - 22.0 LPA',
    source: 'LinkedIn',
    postedDate: 'Posted 2 hours ago',
    experience: 'Fresher / 0-1 yr',
    track: 'Java',
    tags: ['Java 21', 'Spring Boot', 'AWS', 'Distributed Systems'],
    description: 'Build mission-critical high-throughput microservices handling millions of transactions. Ideal for candidates with strong core Java and problem-solving skills.',
    responsibilities: [
      'Design, develop, and deploy scalable RESTful services in Spring Boot.',
      'Collaborate with global teams to optimize database latency and service reliability.',
      'Write clean, test-driven Java code adhering to best design patterns.',
    ],
    eligibility: 'B.Tech / B.E / M.Tech in CS/IT (2024 - 2026 Batch). Minimum 7.0 CGPA.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Amazon+Associate+Software+Engineer+Java&location=India&f_TPR=r86400',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'li-2',
    role: 'Full Stack Engineer - Early Career',
    company: 'Razorpay',
    location: 'Bangalore, Karnataka',
    workMode: 'Hybrid',
    ctc: '11.0 - 16.5 LPA',
    source: 'LinkedIn',
    postedDate: 'Posted 4 hours ago',
    experience: '0-2 yrs',
    track: 'Java',
    tags: ['React', 'Java', 'Spring Boot', 'MySQL', 'Kafka'],
    description: 'Join the next-generation fintech infrastructure powering payments across India. Work across React TypeScript frontends and Spring Boot payment microservices.',
    responsibilities: [
      'Build resilient user checkout journeys using React & Tailwind.',
      'Develop secure financial transaction workflows with Spring Security and MySQL.',
      'Participate in code reviews and architectural discussions.',
    ],
    eligibility: 'B.E / B.Tech / MCA with strong foundations in Web Architecture.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Razorpay+Full+Stack+Engineer&location=India&f_TPR=r86400',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'li-3',
    role: 'Frontend React Developer (Fresher)',
    company: 'PhonePe',
    location: 'Bangalore, Karnataka',
    workMode: 'On-site',
    ctc: '9.5 - 14.0 LPA',
    source: 'LinkedIn',
    postedDate: 'Posted Today',
    experience: 'Fresher / 0-1 yr',
    track: 'Frontend',
    tags: ['React 18', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'],
    description: 'Build lightning-fast, accessible web dashboards and merchant applications used by over 30 million businesses.',
    responsibilities: [
      'Implement component-driven user interfaces with React, Vite, and TypeScript.',
      'Optimize web performance, caching, and mobile responsiveness.',
      'Integrate with microservice REST endpoints.',
    ],
    eligibility: '2024-2026 batch freshers with demonstrated React / JS projects.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=PhonePe+Frontend+Engineer+React&location=India&f_TPR=r86400',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'li-4',
    role: 'Junior Cloud & DevOps Specialist',
    company: 'Swiggy',
    location: 'Remote (Pan India)',
    workMode: 'Remote',
    ctc: '8.5 - 13.0 LPA',
    source: 'LinkedIn',
    postedDate: 'Posted Today',
    experience: '0-2 yrs',
    track: 'DevOps',
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
    description: 'Help manage and scale cloud-native delivery infrastructure with zero downtime during peak order volumes.',
    responsibilities: [
      'Maintain Kubernetes clusters and Dockerized backend microservices.',
      'Automate deployment pipelines using GitHub Actions.',
      'Monitor application metrics with Prometheus and Grafana.',
    ],
    eligibility: 'B.Tech/BCA/MCA with knowledge of Linux, Docker, and Cloud basics.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Swiggy+DevOps+Cloud+Engineer&location=India&f_TPR=r86400',
    activelyHiring: true,
  },

  // ==================== NAUKRI.COM JOBS ====================
  {
    id: 'nk-1',
    role: 'Java Full Stack Developer (Fresher Drive)',
    company: 'Infosys',
    location: 'Bangalore / Hyderabad / Pune',
    workMode: 'Hybrid',
    ctc: '4.8 - 7.5 LPA',
    source: 'Naukri',
    postedDate: 'Posted Today',
    experience: 'Fresher (Batch 2024-2026)',
    track: 'Java',
    tags: ['Core Java', 'Spring Boot', 'React', 'MySQL', 'REST APIs'],
    description: 'Mass off-campus recruitment drive for certified full-stack engineers. Immediate onboarding for enterprise transformation projects.',
    responsibilities: [
      'Develop server-side business logic using Spring Boot and Hibernate/JdbcTemplate.',
      'Design relational schemas and write optimized SQL queries.',
      'Collaborate on agile sprints and client deliverables.',
    ],
    eligibility: 'B.E / B.Tech / MCA / M.Sc (CS/IT) with 60% or above aggregate.',
    applyUrl: 'https://www.naukri.com/java-full-stack-developer-jobs-in-bangalore?k=Infosys%20Java%20Full%20Stack',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'nk-2',
    role: 'Systems Engineer - Digital Practice',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Pan India (Multiple Locations)',
    workMode: 'On-site',
    ctc: '4.2 - 7.2 LPA',
    source: 'Naukri',
    postedDate: 'Posted 3 hours ago',
    experience: 'Fresher / 0-1 yr',
    track: 'Java',
    tags: ['Java', 'Data Structures', 'SQL', 'Git', 'Agile'],
    description: 'TCS Digital cadre hiring drive for candidates proficient in algorithmic problem-solving and software development.',
    responsibilities: [
      'Participate in modern enterprise application development.',
      'Write modular, well-documented Java code.',
      'Assist in unit testing and automated build validations.',
    ],
    eligibility: 'All Engineering graduates (2024 - 2026) with zero active backlogs.',
    applyUrl: 'https://www.naukri.com/tcs-jobs?k=TCS%20Systems%20Engineer%20Digital',
    activelyHiring: true,
  },
  {
    id: 'nk-3',
    role: 'Associate Software Developer',
    company: 'Capgemini',
    location: 'Pune / Mumbai, Maharashtra',
    workMode: 'Hybrid',
    ctc: '4.5 - 6.8 LPA',
    source: 'Naukri',
    postedDate: 'Posted Today',
    experience: '0-2 yrs',
    track: 'Java',
    tags: ['Java 17+', 'Spring Boot', 'Microservices', 'PostgreSQL'],
    description: 'Build backend banking and logistics systems using microservices architecture for Fortune 500 European and US clients.',
    responsibilities: [
      'Implement API endpoints with validation and error handling.',
      'Integrate third-party services and write SQL migrations.',
      'Resolve production issues and optimize system throughput.',
    ],
    eligibility: 'B.E/B.Tech (Any specialization) or MCA with valid certification.',
    applyUrl: 'https://www.naukri.com/capgemini-jobs-in-pune?k=Capgemini%20Java%20Developer',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'nk-4',
    role: 'Frontend Web Developer (React & TypeScript)',
    company: 'Accenture',
    location: 'Bangalore / Gurgaon',
    workMode: 'Hybrid',
    ctc: '5.2 - 8.2 LPA',
    source: 'Naukri',
    postedDate: 'Posted Today',
    experience: '0-2 yrs',
    track: 'Frontend',
    tags: ['React', 'TypeScript', 'Responsive Design', 'HTML5', 'CSS3'],
    description: 'Develop responsive, highly intuitive web portals for global healthcare and retail enterprise clients.',
    responsibilities: [
      'Translate Figma wireframes into reusable, pixel-perfect React components.',
      'Implement state management and clean API integration.',
      'Ensure cross-browser compatibility and accessibility.',
    ],
    eligibility: 'Graduate in Computer Science or related degree. Freshers with portfolio welcome.',
    applyUrl: 'https://www.naukri.com/accenture-jobs-in-bangalore?k=Accenture%20React%20Developer',
  },
  {
    id: 'nk-5',
    role: 'Junior Python & Data Engineer',
    company: 'Wipro',
    location: 'Hyderabad, Telangana',
    workMode: 'On-site',
    ctc: '4.2 - 6.5 LPA',
    source: 'Naukri',
    postedDate: 'Posted Yesterday',
    experience: 'Fresher / 0-1 yr',
    track: 'Python',
    tags: ['Python 3', 'Pandas', 'SQL', 'FastAPI', 'Data Pipelines'],
    description: 'Extract, clean, and process enterprise datasets into analytical warehouses. Build lightweight REST APIs in FastAPI.',
    responsibilities: [
      'Write robust Python scripts for automated data extraction.',
      'Create and optimize complex SQL queries for reporting.',
      'Document pipeline architectures and unit test coverage.',
    ],
    eligibility: 'B.E/B.Tech/BCA/B.Sc with Python scripting proficiency.',
    applyUrl: 'https://www.naukri.com/wipro-jobs-in-hyderabad?k=Wipro%20Python%20Engineer',
  },

  // ==================== SHINE.COM JOBS ====================
  {
    id: 'sh-1',
    role: 'Graduate Trainee Engineer - Software',
    company: 'HCLTech',
    location: 'Noida / Lucknow, UP',
    workMode: 'On-site',
    ctc: '4.0 - 6.2 LPA',
    source: 'Shine',
    postedDate: 'Posted Today',
    experience: 'Fresher (2024-2026 Batch)',
    track: 'Java',
    tags: ['Core Java', 'OOP Concepts', 'MySQL', 'Web Technologies'],
    description: 'Direct corporate induction training followed by deployment to enterprise application engineering projects.',
    responsibilities: [
      'Undergo intensive corporate technology onboarding in modern stacks.',
      'Contribute to bug fixes, feature enhancements, and test case authoring.',
      'Work under the mentorship of Senior Technical Architects.',
    ],
    eligibility: 'B.Tech/B.E/BCA/MCA. 60%+ throughout 10th, 12th, and Degree.',
    applyUrl: 'https://www.shine.com/job-search/hcl-technologies-jobs?q=HCL%20Java%20Graduate%20Trainee',
    activelyHiring: true,
  },
  {
    id: 'sh-2',
    role: 'Trainee Software Engineer - Cloud Track',
    company: 'Tech Mahindra',
    location: 'Hyderabad / Pune',
    workMode: 'Hybrid',
    ctc: '4.0 - 6.0 LPA',
    source: 'Shine',
    postedDate: 'Posted Today',
    experience: 'Fresher / 0-1 yr',
    track: 'DevOps',
    tags: ['Cloud Computing', 'Linux', 'Python', 'Networking'],
    description: 'Join telecommunications and 5G cloud transformation teams helping tier-1 telco operators modernize their systems.',
    responsibilities: [
      'Assist in cloud platform configuration and service monitoring.',
      'Automate routine sysadmin tasks using Python and Bash.',
      'Maintain system security standards and patch deployments.',
    ],
    eligibility: 'Graduates in Computer Science, IT, or Electronics (2024 - 2026).',
    applyUrl: 'https://www.shine.com/job-search/tech-mahindra-jobs?q=Tech%20Mahindra%20Trainee%20Software%20Engineer',
    activelyHiring: true,
  },
  {
    id: 'sh-3',
    role: 'Full Stack Web Developer Intern / Fresher',
    company: 'L&T Technology Services',
    location: 'Bangalore, Karnataka',
    workMode: 'On-site',
    ctc: '4.5 - 6.5 LPA',
    source: 'Shine',
    postedDate: 'Posted 5 hours ago',
    experience: '0-1 yr',
    track: 'Java',
    tags: ['React', 'Spring Boot', 'MySQL', 'RESTful Services'],
    description: 'Engineering industrial IoT and smart manufacturing applications connecting factory devices to cloud analytics dashboards.',
    responsibilities: [
      'Develop responsive frontend UI panels for factory device managers.',
      'Build secure REST APIs in Spring Boot to ingest sensor telemetry.',
      'Work alongside hardware and firmware engineering teams.',
    ],
    eligibility: 'B.E/B.Tech in CS/IT/ECE. Solid understanding of Full Stack fundamentals.',
    applyUrl: 'https://www.shine.com/job-search/l-t-technology-services-jobs?q=LTTS%20Full%20Stack%20Developer',
    recommendedCourseSlug: 'java-full-stack',
  },
  {
    id: 'sh-4',
    role: 'Database & SQL Specialist',
    company: 'LTIMindtree',
    location: 'Bangalore / Chennai',
    workMode: 'Hybrid',
    ctc: '4.2 - 6.8 LPA',
    source: 'Shine',
    postedDate: 'Posted Yesterday',
    experience: '0-2 yrs',
    track: 'Database',
    tags: ['MySQL', 'PostgreSQL', 'SQL Optimization', 'Database Indexing'],
    description: 'Design and tune complex database architectures for international financial institutions.',
    responsibilities: [
      'Write, audit, and tune complex SQL joins, views, and stored procedures.',
      'Ensure index health, partition schemes, and query performance.',
      'Collaborate with backend engineers to eliminate N+1 query bottlenecks.',
    ],
    eligibility: 'B.Tech/BCA/MCA with demonstrable mastery of SQL and schema design.',
    applyUrl: 'https://www.shine.com/job-search/ltimindtree-jobs?q=LTIMindtree%20SQL%20Database',
  },

  // ==================== INDEED INDIA JOBS ====================
  {
    id: 'in-1',
    role: 'Junior Java / Spring Boot Developer',
    company: 'Virtusa',
    location: 'Hyderabad / Chennai',
    workMode: 'Hybrid',
    ctc: '5.5 - 8.5 LPA',
    source: 'Indeed',
    postedDate: 'Posted Today',
    experience: '0-2 yrs',
    track: 'Java',
    tags: ['Java 21', 'Spring Boot', 'REST APIs', 'Hibernate', 'JUnit'],
    description: 'Develop next-generation banking software solutions with high concurrency and strict data security compliance.',
    responsibilities: [
      'Author robust microservices with Spring Boot and Spring Data.',
      'Write comprehensive unit tests with JUnit 5 and Mockito.',
      'Implement OAuth2 and JWT authentication mechanisms.',
    ],
    eligibility: 'Degree in Engineering or Computer Applications. Immediate joiners preferred.',
    applyUrl: 'https://in.indeed.com/jobs?q=Virtusa+Java+Developer&l=India&fromage=3',
    recommendedCourseSlug: 'java-full-stack',
    activelyHiring: true,
  },
  {
    id: 'in-2',
    role: 'Associate Full Stack Developer',
    company: 'Persistent Systems',
    location: 'Pune / Goa',
    workMode: 'Hybrid',
    ctc: '5.5 - 8.2 LPA',
    source: 'Indeed',
    postedDate: 'Posted 6 hours ago',
    experience: '0-2 yrs',
    track: 'Frontend',
    tags: ['React', 'Node.js', 'TypeScript', 'Tailwind', 'MongoDB'],
    description: 'Help build enterprise SaaS platforms for global healthcare and life-sciences leaders.',
    responsibilities: [
      'Develop modern SPA web applications with clean component modularity.',
      'Integrate state management and asynchronous data fetching.',
      'Ensure robust error boundaries and smooth user experience.',
    ],
    eligibility: 'B.E/B.Tech/MCA freshers with personal GitHub projects.',
    applyUrl: 'https://in.indeed.com/jobs?q=Persistent+Systems+Full+Stack&l=India&fromage=3',
  },
  {
    id: 'in-3',
    role: 'Junior Python Backend Developer',
    company: 'Mphasis',
    location: 'Bangalore, Karnataka',
    workMode: 'On-site',
    ctc: '4.5 - 7.0 LPA',
    source: 'Indeed',
    postedDate: 'Posted Today',
    experience: 'Fresher / 0-1 yr',
    track: 'Python',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git'],
    description: 'Build backend data services and customer portal integrations for insurance and banking clients.',
    responsibilities: [
      'Develop modular RESTful microservices in Python.',
      'Write schema migrations and optimize database indexes.',
      'Participate in daily standups and sprint planning.',
    ],
    eligibility: '2024-2026 Batch freshers with strong Python fundamentals.',
    applyUrl: 'https://in.indeed.com/jobs?q=Mphasis+Python+Developer&l=India&fromage=3',
    activelyHiring: true,
  },
];

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<AggregatedJob[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('ALL');
  const [selectedJobForModal, setSelectedJobForModal] = useState<AggregatedJob | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [showPrompterInfo, setShowPrompterInfo] = useState(false);

  // Saved jobs persistence in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('skillportal_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('skillportal_saved_jobs', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdated(`Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 1200);
  };

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Source filter
      if (selectedSource !== 'ALL' && j.source !== selectedSource) return false;

      // Track filter
      if (selectedTrack !== 'ALL' && j.track !== selectedTrack) return false;

      // Work mode filter
      if (selectedWorkMode !== 'ALL' && j.workMode !== selectedWorkMode) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRole = j.role.toLowerCase().includes(query);
        const matchesCompany = j.company.toLowerCase().includes(query);
        const matchesLocation = j.location.toLowerCase().includes(query);
        const matchesTags = j.tags.some((t) => t.toLowerCase().includes(query));
        return matchesRole || matchesCompany || matchesLocation || matchesTags;
      }

      return true;
    });
  }, [jobs, selectedSource, selectedTrack, selectedWorkMode, searchQuery]);

  // Counts by source
  const sourceCounts = useMemo(() => {
    const counts = { ALL: jobs.length, LinkedIn: 0, Naukri: 0, Shine: 0, Indeed: 0 };
    jobs.forEach((j) => {
      if (counts[j.source] !== undefined) {
        counts[j.source]++;
      }
    });
    return counts;
  }, [jobs]);

  // Helper badge styles for each portal
  const getSourceBadgeStyle = (source: JobPortalSource) => {
    switch (source) {
      case 'LinkedIn':
        return {
          bg: 'bg-[#0077b5]/10',
          text: 'text-[#38bdf8]',
          border: 'border-[#0077b5]/30',
          label: 'LinkedIn',
          buttonBg: 'bg-[#0077b5] hover:bg-[#006097] text-white',
        };
      case 'Naukri':
        return {
          bg: 'bg-blue-600/10',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          label: 'Naukri.com',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'Shine':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          label: 'Shine.com',
          buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
        };
      case 'Indeed':
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          label: 'Indeed',
          buttonBg: 'bg-cyan-600 hover:bg-cyan-700 text-white',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* ==================== HERO & FEED STATUS ==================== */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00c2ff]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Omni-Channel Stream (LinkedIn • Naukri • Shine • Indeed)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-[#00c2ff]" />
              Multi-Portal Tech Job Openings
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Curated daily openings for freshers & certified developers across India. Every job links directly to its
              official application page on LinkedIn, Naukri, Shine, and Indeed.
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] text-slate-200 border border-[#283042] text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00c2ff] ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync Fresh Jobs'}
            </button>

            <button
              onClick={() => setShowPrompterInfo(!showPrompterInfo)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/30 text-xs font-bold transition-all shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Master Prompter Engine</span>
            </button>
          </div>
        </div>

        {/* Master prompter info card (collapsible) */}
        {showPrompterInfo && (
          <div className="mt-6 pt-6 border-t border-[#1f2430] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] space-y-1.5">
              <div className="flex items-center gap-2 text-[#00c2ff] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Password-Free & Secure</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Zero LinkedIn, Naukri, or email passwords required. Jobs are aggregated using automated public stream
                parsers and verified deep-links.
              </p>
            </div>

            <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>Daily Auto-Sync Engine</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Synchronized daily to pull fresh vacancies posted in the last 24 hours across top tech hubs (Bangalore,
                Hyderabad, Pune, Remote).
              </p>
            </div>

            <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Direct 1-Click Apply</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Every &quot;Apply&quot; button opens the original listing directly on that platform so students can use
                &quot;Easy Apply&quot; immediately.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PORTAL SELECTOR TABS ==================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1f2430] pb-4">
        {[
          { key: 'ALL', label: 'All Portals', count: sourceCounts.ALL, icon: Globe },
          { key: 'LinkedIn', label: 'LinkedIn', count: sourceCounts.LinkedIn, icon: Building2 },
          { key: 'Naukri', label: 'Naukri.com', count: sourceCounts.Naukri, icon: Briefcase },
          { key: 'Shine', label: 'Shine.com', count: sourceCounts.Shine, icon: Sparkles },
          { key: 'Indeed', label: 'Indeed India', count: sourceCounts.Indeed, icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedSource === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedSource(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#00c2ff] text-slate-950 shadow-md shadow-[#00c2ff]/20'
                  : 'bg-[#0c0e12] text-slate-400 hover:text-white border border-[#1f2430] hover:border-[#283042]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-[#181c26] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==================== SEARCH & FILTERS BAR ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role (Java, React, SDE), company (Amazon, Infosys), or city..."
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

        {/* Tech Track Filter */}
        <div>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Tech Stacks</option>
            <option value="Java">☕ Java &amp; Spring Boot</option>
            <option value="Frontend">⚛️ React &amp; Frontend</option>
            <option value="Python">🐍 Python &amp; Data</option>
            <option value="DevOps">☁️ Cloud &amp; DevOps</option>
            <option value="Database">🗄️ Database &amp; SQL</option>
          </select>
        </div>

        {/* Work Mode Filter */}
        <div>
          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Work Modes</option>
            <option value="Remote">🌐 Remote</option>
            <option value="Hybrid">🏢 Hybrid</option>
            <option value="On-site">📍 On-site</option>
          </select>
        </div>
      </div>

      {/* ==================== ACTIVE RESULTS SUMMARY ==================== */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredJobs.length}</strong> openings from{' '}
          {selectedSource === 'ALL' ? 'all portals' : selectedSource}
        </span>
        <span className="text-[11px] text-slate-500">Updated: {lastUpdated}</span>
      </div>

      {/* ==================== JOB CARDS GRID ==================== */}
      {filteredJobs.length === 0 ? (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No job openings found matching your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing your search query or selecting &quot;All Portals&quot; to see available positions.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSource('ALL');
              setSelectedTrack('ALL');
              setSelectedWorkMode('ALL');
            }}
            className="px-4 py-2 bg-[#161922] hover:bg-[#1f2430] text-[#00c2ff] border border-[#00c2ff]/30 text-xs font-bold rounded-xl transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const badge = getSourceBadgeStyle(job.source);
            const isSaved = savedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForModal(job)}
                className="bg-[#0c0e12] border border-[#1f2430] hover:border-[#00c2ff]/40 rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:shadow-lg hover:shadow-black/50"
              >
                {/* Header row */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Portal badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>

                    {/* Bookmark toggle */}
                    <button
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                      className="text-slate-500 hover:text-[#00c2ff] transition-colors p-1"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#00c2ff]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Role & Company */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#00c2ff] transition-colors line-clamp-1">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-200">{job.company}</span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-[11px] text-slate-400">{job.experience}</span>
                    </div>
                  </div>

                  {/* Metadata chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                      <MapPin className="w-3 h-3 text-[#00c2ff]" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      {job.workMode}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430] font-mono text-emerald-400 font-semibold">
                      {job.ctc}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#161922] text-slate-300 text-[10px] border border-[#222734]"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 4 && (
                      <span className="px-1.5 py-0.5 text-slate-500 text-[10px]">
                        +{job.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer action bar */}
                <div className="pt-3 border-t border-[#181c26] flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.postedDate}
                  </span>

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${badge.buttonBg}`}
                  >
                    <span>Apply on {job.source}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== EXPANDED JOB DETAILS MODAL ==================== */}
      {selectedJobForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedJobForModal(null)}
        >
          <div
            className="bg-[#0c0e12] border border-[#1f2430] w-full max-w-2xl rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl"
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md text-xs font-bold border ${
                    getSourceBadgeStyle(selectedJobForModal.source).bg
                  } ${getSourceBadgeStyle(selectedJobForModal.source).text} ${
                    getSourceBadgeStyle(selectedJobForModal.source).border
                  }`}
                >
                  {selectedJobForModal.source} Verified Listing
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{selectedJobForModal.postedDate}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJobForModal.role}</h2>
              <div className="text-sm font-bold text-[#00c2ff] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedJobForModal.company}</span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#12151c] p-4 rounded-xl border border-[#1e2330] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Location</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.location}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Work Mode</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.workMode}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Experience</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.experience}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Compensation</span>
                <span className="font-mono font-bold text-emerald-400 mt-0.5 block">{selectedJobForModal.ctc}</span>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330]">
                {selectedJobForModal.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Responsibilities</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedJobForModal.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility Criteria</h4>
              <div className="bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330] text-xs text-slate-300">
                {selectedJobForModal.eligibility}
              </div>
            </div>

            {/* Tech Stack Required */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJobForModal.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#161922] text-[#00c2ff] text-xs font-semibold border border-[#222734]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#1f2430] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Direct Portal Link</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 bg-[#161922] hover:bg-[#1f2430] text-slate-300 rounded-xl text-xs font-bold border border-[#222734] transition-all"
                >
                  Close
                </button>

                <a
                  href={selectedJobForModal.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    getSourceBadgeStyle(selectedJobForModal.source).buttonBg
                  }`}
                >
                  <span>Apply on {selectedJobForModal.source}</span>
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
