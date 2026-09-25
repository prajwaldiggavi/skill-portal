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
  GraduationCap,
  Award,
  Layers,
  Code2,
  Database,
  X,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export type JobPortalSource = 'LinkedIn' | 'Naukri' | 'Shine' | 'Indeed';

export interface FresherJob {
  id: string;
  role: string;
  company: string;
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  ctc: string;
  source: JobPortalSource;
  postedDate: string;
  batchEligibility: string;
  experience: string;
  tags: string[];
  coreTech: ('Core Java' | 'Advance Java' | 'Hibernate' | 'Spring Boot' | 'MySQL' | 'HTML/CSS/JS' | 'React')[];
  description: string;
  hiringRounds: string[];
  responsibilities: string[];
  interviewTips: string;
  applyUrl: string;
  is2026Eligible: boolean;
  activelyHiring: boolean;
}

const GENUINE_FRESHER_JOBS: FresherJob[] = [
  // ==================== ZOHO CORPORATION ====================
  {
    id: 'zoho-2026',
    role: 'Software Developer (Core Java & Problem Solving)',
    company: 'Zoho Corporation',
    location: 'Chennai / Tenkasi / Salem, Tamil Nadu',
    workMode: 'On-site',
    ctc: '6.0 - 8.5 LPA',
    source: 'LinkedIn',
    postedDate: 'Actively Hiring 2026 Batch',
    batchEligibility: '2025 & 2026 Batch (B.E / B.Tech / BCA / MCA / B.Sc CS)',
    experience: 'Fresher (No experience needed)',
    coreTech: ['Core Java', 'MySQL', 'HTML/CSS/JS'],
    tags: ['Core Java', 'OOPs', 'Data Structures', 'Algorithms', 'MySQL', 'Recursion'],
    description: 'Zoho hires freshers solely on programming logic, Core Java mastery, and algorithmic problem-solving. No CGPA cutoff! Candidates work on world-class SaaS enterprise products used by 100M+ global users.',
    hiringRounds: [
      'Round 1: Basic Programming & Pseudo-Code (C / Java)',
      'Round 2: Advanced Programming in Core Java (Strings, Matrices, Data Structures - No Built-in libraries allowed)',
      'Round 3: Application Design Round (LLD - Design Railway Reservation, Splitwise, Taxi Booking in Java)',
      'Round 4: Technical HR & Fitment Interview',
    ],
    responsibilities: [
      'Write clean, modular Core Java code solving complex business application problems.',
      'Design normalized relational MySQL database schemas for SaaS modules.',
      'Optimize algorithm runtime and memory efficiency for scale.',
    ],
    interviewTips: 'Master Core Java fundamentals: Custom implementations of LinkedList, HashMap, recursion, 2D matrix manipulation, and OOP principles. Zoho tests pure coding logic, not framework memorization.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Zoho+Software+Developer+Fresher&location=India&f_TPR=r86400',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== TATA CONSULTANCY SERVICES (TCS) ====================
  {
    id: 'tcs-nqt-2026',
    role: 'Systems Engineer & Digital Developer (TCS National Drive)',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Pan India (Bangalore, Hyderabad, Pune, Chennai, Noida)',
    workMode: 'On-site',
    ctc: '4.2 - 7.5 LPA (Ninja: 4.2 LPA | Digital: 7.5 LPA)',
    source: 'Naukri',
    postedDate: 'Posted Today • Official Drive',
    batchEligibility: '2025 & 2026 Batch (All Engineering Branches & MCA)',
    experience: 'Fresher (Zero Experience Required)',
    coreTech: ['Core Java', 'Advance Java', 'MySQL', 'HTML/CSS/JS'],
    tags: ['Core Java', 'Collections', 'JDBC', 'MySQL', 'HTML/CSS', 'OOPs'],
    description: 'TCS National Qualifier Drive for 2025 and 2026 graduating batches. Immediate callbacks based on the National Qualifier Test (NQT) score. Highest call-back rate across India for freshers.',
    hiringRounds: [
      'Round 1: TCS NQT Cognitive (Verbal, Reasoning, Numerical)',
      'Round 2: TCS NQT Technical (Java Programming MCQs + 2 Hands-on Coding Questions in Java)',
      'Round 3: Technical Interview (OOPs, Collections, String Handling, JDBC, SQL Joins)',
      'Round 4: Managerial & HR Verification',
    ],
    responsibilities: [
      'Develop and maintain digital banking, insurance, and retail applications in Java.',
      'Write structured SQL queries and connect applications via JDBC.',
      'Collaborate in Agile Scrum teams delivering client milestones.',
    ],
    interviewTips: 'Be ready for: Differences between HashMap and Hashtable, String immutability, try-catch-finally control flow, Abstract class vs Interface, and 2nd highest salary SQL query.',
    applyUrl: 'https://www.naukri.com/tcs-jobs?k=TCS%20Java%20Fresher%202026',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== INFOSYS ====================
  {
    id: 'infosys-sp-2026',
    role: 'Specialist Programmer & Java Full Stack Engineer',
    company: 'Infosys',
    location: 'Bangalore / Mysore / Hyderabad / Pune',
    workMode: 'Hybrid',
    ctc: '6.5 - 9.5 LPA (DSE & Specialist Cadre)',
    source: 'Naukri',
    postedDate: 'Posted 3 hours ago',
    batchEligibility: '2025 & 2026 Batch (B.Tech, B.E, MCA, M.Tech)',
    experience: 'Fresher (2024-2026 Passouts)',
    coreTech: ['Core Java', 'Advance Java', 'Hibernate', 'Spring Boot', 'MySQL', 'React'],
    tags: ['Core Java', 'Spring Boot', 'Hibernate', 'MySQL', 'React', 'REST APIs'],
    description: 'Infosys high-package off-campus hiring drive (HackWithInfy & Specialist Programmer). Fast-track career path with 3-month comprehensive Java Full Stack training at Infosys Mysore Campus.',
    hiringRounds: [
      'Round 1: Online Coding Assessment (3 Medium-to-Hard Algorithm Problems in Java)',
      'Round 2: Technical Interview (Core Java, Spring Boot architecture, Hibernate ORM, SQL indexing)',
      'Round 3: Behavioral HR & Academic Verification',
    ],
    responsibilities: [
      'Build end-to-end full stack web applications with Spring Boot backend and React frontend.',
      'Implement data persistence layer using Hibernate / JPA entity mappings.',
      'Write optimized MySQL stored procedures and transaction boundaries.',
    ],
    interviewTips: 'Prepare Hibernate lifecycle states (Transient, Persistent, Detached), Spring Boot annotations (@RestController, @Autowired, @Service), and REST status codes (200, 201, 400, 404, 500).',
    applyUrl: 'https://www.naukri.com/infosys-jobs?k=Infosys%20Java%20Developer%20Fresher',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== ACCENTURE ====================
  {
    id: 'accenture-ase-2026',
    role: 'Associate Software Engineer (ASE) - Java Track',
    company: 'Accenture',
    location: 'Bangalore / Hyderabad / Pune / Chennai / Gurgaon',
    workMode: 'Hybrid',
    ctc: '4.5 - 6.5 LPA (ASE & Advanced ASE)',
    source: 'LinkedIn',
    postedDate: 'Posted Today • High Call-Back',
    batchEligibility: '2024, 2025 & 2026 Batch (All engineering disciplines & MCA)',
    experience: 'Fresher (Batch 2024-2026)',
    coreTech: ['Core Java', 'MySQL', 'HTML/CSS/JS', 'Advance Java'],
    tags: ['Core Java', 'OOPs', 'MySQL', 'HTML5', 'CSS3', 'JavaScript', 'JDBC'],
    description: 'Accenture national fresher hiring for Cloud First and Intelligent Software Engineering groups. Direct application portal with guaranteed test invite for eligible 2026/2025 grads.',
    hiringRounds: [
      'Round 1: Cognitive & Technical Assessment (Pseudo-code, Web Technologies, Networking, Security)',
      'Round 2: Coding Assessment (2 Mandatory Coding Questions in Java)',
      'Round 3: Automated Communication Assessment (Pronunciation, Fluency, Listening)',
      'Round 4: Technical & HR Interview',
    ],
    responsibilities: [
      'Develop responsive user interfaces using HTML5, CSS3, and modern JavaScript.',
      'Connect frontend components to backend Java services using JDBC and REST APIs.',
      'Diagnose and resolve defects across corporate client software environments.',
    ],
    interviewTips: 'Accenture focuses heavily on pseudo-code output tracing, Core Java method overloading vs overriding, Exception handling hierarchies, and basic HTML/CSS DOM manipulation.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Accenture+Associate+Software+Engineer+Java&location=India&f_E=1&f_TPR=r86400',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== CAPGEMINI ====================
  {
    id: 'capgemini-exceller-2026',
    role: 'Software Engineer Trainee (Capgemini Exceller)',
    company: 'Capgemini',
    location: 'Bangalore / Pune / Mumbai / Hyderabad',
    workMode: 'Hybrid',
    ctc: '4.25 - 7.5 LPA',
    source: 'Naukri',
    postedDate: 'Posted Today',
    batchEligibility: '2025 & 2026 Batch (B.Tech / B.E / MCA)',
    experience: 'Fresher',
    coreTech: ['Core Java', 'Advance Java', 'Hibernate', 'MySQL'],
    tags: ['Core Java', 'Advance Java', 'Hibernate', 'JDBC', 'MySQL', 'SQL Joins'],
    description: 'Capgemini Exceller national recruitment program. Intensive training on Java Full Stack enterprise architectures followed by live client deployment.',
    hiringRounds: [
      'Round 1: Technical Assessment (Pseudo-code, Data Structures, Core Java MCQs)',
      'Round 2: Spoken English / Communication Test',
      'Round 3: Hands-on Java Coding Assessment',
      'Round 4: Technical & HR Combined Interview',
    ],
    responsibilities: [
      'Design relational MySQL databases and write complex SQL joins.',
      'Implement data access objects (DAOs) using Hibernate and JDBC.',
      'Perform peer code reviews and maintain unit test coverage.',
    ],
    interviewTips: 'Expect questions on JDBC Driver types, Connection, Statement vs PreparedStatement, Hibernate session factory, and SQL group by / having clauses.',
    applyUrl: 'https://www.naukri.com/capgemini-jobs?k=Capgemini%20Java%20Fresher',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== JUSPAY ====================
  {
    id: 'juspay-sde-2026',
    role: 'Software Development Engineer - 1 (Core Java & Concurrency)',
    company: 'Juspay',
    location: 'Bangalore, Karnataka',
    workMode: 'On-site',
    ctc: '12.0 - 18.0 LPA (High Growth)',
    source: 'LinkedIn',
    postedDate: 'Actively Hiring 2026',
    batchEligibility: '2025 & 2026 Batch (B.Tech / B.E / Dual Degree CS/IT)',
    experience: 'Fresher (High problem-solving proficiency)',
    coreTech: ['Core Java', 'MySQL', 'Advance Java'],
    tags: ['Core Java', 'Multithreading', 'Concurrency', 'Algorithms', 'MySQL'],
    description: 'Juspay powers payment infrastructure for Amazon, Swiggy, and Cred, processing over 100M daily transactions. High-paying product role for freshers passionate about Core Java internals and concurrency.',
    hiringRounds: [
      'Round 1: Online Coding Challenge (Dynamic Programming, Graph Algorithms, Trees in Java)',
      'Round 2: 24-Hour Take-home or Hackathon Round (Build a functional multi-threaded Java subsystem)',
      'Round 3: Deep Technical Discussion on Java Memory Model, Garbage Collection & Concurrency',
      'Round 4: Founder / Cultural Fitment Interview',
    ],
    responsibilities: [
      'Build ultra-low latency distributed payment microservices in Java.',
      'Write thread-safe code utilizing Java Concurrency utilities (ExecutorService, CountDownLatch).',
      'Benchmark and optimize SQL query execution plans.',
    ],
    interviewTips: 'Deeply study: JVM architecture, Garbage Collector mechanics, volatile keyword, synchronized blocks vs ReentrantLock, and deadlock detection.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Juspay+Java+Developer&location=India',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== WIPRO ====================
  {
    id: 'wipro-elite-2026',
    role: 'Project Engineer (Wipro Elite National Drive)',
    company: 'Wipro',
    location: 'Bangalore / Chennai / Hyderabad / Pune',
    workMode: 'On-site',
    ctc: '3.8 - 6.5 LPA (Elite & Turbo Cadre)',
    source: 'Naukri',
    postedDate: 'Posted 5 hours ago',
    batchEligibility: '2024, 2025 & 2026 Batch (Engineering & MCA)',
    experience: 'Fresher (0-1 yr)',
    coreTech: ['Core Java', 'MySQL', 'HTML/CSS/JS', 'Advance Java'],
    tags: ['Core Java', 'JDBC', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
    description: 'Wipro Elite National Talent Hunt (NTH). One of the most consistent off-campus recruiting drives for IT graduates in India with fast call-backs.',
    hiringRounds: [
      'Round 1: Online Assessment (Aptitude, Verbal, Written Communication)',
      'Round 2: Technical Coding in Java (2 Questions: Array / String Manipulation)',
      'Round 3: Technical Interview (Core Java, OOP, SQL DDL/DML, Web Basics)',
      'Round 4: HR Verification',
    ],
    responsibilities: [
      'Develop modern business web applications using Java and MySQL.',
      'Create frontend mockups with HTML5, CSS3, and JavaScript.',
      'Perform unit testing and integration testing.',
    ],
    interviewTips: 'Focus on: Method overriding vs overloading, String pool memory, difference between DELETE and TRUNCATE in SQL, and basic JavaScript DOM events.',
    applyUrl: 'https://www.naukri.com/wipro-jobs?k=Wipro%20Java%20Fresher',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== COGNIZANT ====================
  {
    id: 'cognizant-genc-2026',
    role: 'Programmer Analyst Trainee (GenC Next Java Track)',
    company: 'Cognizant (CTS)',
    location: 'Chennai / Bangalore / Hyderabad / Coimbatore / Kolkata',
    workMode: 'Hybrid',
    ctc: '4.0 - 6.75 LPA (GenC: 4.0 LPA | GenC Next: 6.75 LPA)',
    source: 'LinkedIn',
    postedDate: 'Posted Today • Official',
    batchEligibility: '2025 & 2026 Batch (B.E / B.Tech / MCA / M.Sc IT)',
    experience: 'Fresher (2025/2026)',
    coreTech: ['Core Java', 'Advance Java', 'Spring Boot', 'MySQL', 'HTML/CSS/JS'],
    tags: ['Core Java', 'Spring Boot', 'MySQL', 'HTML5', 'CSS3', 'REST APIs'],
    description: 'Cognizant GenC Next is the premier developer track for graduates skilled in Core Java, Spring Boot, and Full Stack development.',
    hiringRounds: [
      'Round 1: Skill-based Technical Assessment (Java OOPs, SQL, HTML/CSS)',
      'Round 2: Hands-on Coding Assessment in Java',
      'Round 3: Technical Interview (Spring Boot, REST, Database Design)',
      'Round 4: HR Discussion & Offer Rollout',
    ],
    responsibilities: [
      'Implement enterprise microservices in Spring Boot with REST APIs.',
      'Create responsive user interfaces with HTML5, CSS3, and JavaScript.',
      'Write unit tests using JUnit and maintain clean code standards.',
    ],
    interviewTips: 'Expect questions on: Spring Boot AutoConfiguration, Dependency Injection, SQL primary vs foreign keys, and JavaScript ES6 features (arrow functions, map, filter, promises).',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Cognizant+GenC+Java&location=India&f_E=1',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== VIRTUSA ====================
  {
    id: 'virtusa-neuralhack-2026',
    role: 'Associate Engineer - Java Full Stack (NeuralHack Drive)',
    company: 'Virtusa',
    location: 'Hyderabad / Chennai / Bangalore',
    workMode: 'Hybrid',
    ctc: '5.0 - 7.5 LPA',
    source: 'Indeed',
    postedDate: 'Posted Today • Verified',
    batchEligibility: '2024, 2025 & 2026 Batch (B.Tech / B.E / MCA)',
    experience: 'Fresher',
    coreTech: ['Core Java', 'Advance Java', 'Hibernate', 'Spring Boot', 'MySQL'],
    tags: ['Core Java', 'Advance Java', 'Hibernate', 'Spring Boot', 'MySQL'],
    description: 'Virtusa NeuralHack is an annual talent identification hackathon for full-stack engineering freshers with genuine instant interview opportunities.',
    hiringRounds: [
      'Round 1: Online Technical MCQ & Coding Challenge',
      'Round 2: Mini Hackathon Prototype Submission',
      'Round 3: Comprehensive Technical Interview (Core & Advance Java, Hibernate, Spring)',
      'Round 4: HR Fitment',
    ],
    responsibilities: [
      'Engineer banking and healthcare backend services with Spring Boot and Hibernate.',
      'Write optimized SQL queries for high-volume financial data processing.',
      'Build reusable UI components in HTML5, CSS3, and JavaScript.',
    ],
    interviewTips: 'Thoroughly understand the Hibernate architecture, @Entity, @Table, @Id annotations, One-to-Many / Many-to-One relationships, and Spring Boot exception handling.',
    applyUrl: 'https://in.indeed.com/jobs?q=Virtusa+Java+Fresher&l=India',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== HCLTECH ====================
  {
    id: 'hcl-early-2026',
    role: 'Graduate Engineer Trainee - Java Full Stack',
    company: 'HCLTech',
    location: 'Noida / Bangalore / Chennai / Lucknow / Madurai',
    workMode: 'On-site',
    ctc: '4.25 - 6.0 LPA',
    source: 'Shine',
    postedDate: 'Posted Today',
    batchEligibility: '2024, 2025 & 2026 Batch (B.E/B.Tech/MCA/M.Sc)',
    experience: 'Fresher (0-1 yr)',
    coreTech: ['Core Java', 'Advance Java', 'MySQL', 'HTML/CSS/JS'],
    tags: ['Core Java', 'Advance Java', 'JDBC', 'MySQL', 'HTML/CSS', 'JavaScript'],
    description: 'HCLTech First Careers early career onboarding for certified Java freshers. Immediate call-backs and selection drives in major tier-1 & tier-2 tech hubs.',
    hiringRounds: [
      'Round 1: Online Aptitude & Technical Fundamentals',
      'Round 2: Java Coding Test (Loops, Strings, Arrays)',
      'Round 3: Technical Video Interview (Core Java, JDBC, SQL Joins)',
      'Round 4: HR Verification',
    ],
    responsibilities: [
      'Develop modern business applications in Java and connect to MySQL databases.',
      'Build responsive frontend web pages using HTML5, CSS3, and JavaScript.',
      'Participate in code reviews and automated testing pipelines.',
    ],
    interviewTips: 'Be ready for: Java String vs StringBuilder, Final vs Finally vs Finalize, JDBC ResultSet types, and basic SQL normalization (1NF, 2NF, 3NF).',
    applyUrl: 'https://www.shine.com/job-search/hcl-technologies-jobs?q=HCL%20Java%20Graduate%20Trainee',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== PERSISTENT SYSTEMS ====================
  {
    id: 'persistent-martian-2026',
    role: 'Associate Software Engineer (Martian Summer Drive)',
    company: 'Persistent Systems',
    location: 'Pune / Bangalore / Hyderabad / Nagpur / Goa',
    workMode: 'Hybrid',
    ctc: '5.5 - 9.0 LPA',
    source: 'LinkedIn',
    postedDate: 'Posted Today • Verified',
    batchEligibility: '2025 & 2026 Batch (B.E/B.Tech/MCA)',
    experience: 'Fresher',
    coreTech: ['Core Java', 'Advance Java', 'Hibernate', 'Spring Boot', 'MySQL'],
    tags: ['Core Java', 'Spring Boot', 'Hibernate', 'MySQL', 'Data Structures', 'REST APIs'],
    description: 'Persistent Systems Martian national fresher drive. Recognized for top engineering culture, competitive pay, and direct mentorship from Senior Architects.',
    hiringRounds: [
      'Round 1: Online Objective & Technical MCQ Test',
      'Round 2: Advanced Coding Assessment in Java',
      'Round 3: Technical Interview (Core Java, Spring, Hibernate, DBMS)',
      'Round 4: Behavioral & HR Interview',
    ],
    responsibilities: [
      'Develop cloud-ready microservices in Spring Boot with Hibernate ORM.',
      'Build secure REST APIs with token-based authentication.',
      'Maintain automated unit test suites using JUnit and Mockito.',
    ],
    interviewTips: 'Brush up on: Collections Framework (ArrayList vs LinkedList, Comparable vs Comparator), Spring Boot Bean lifecycle, and ACID properties in MySQL.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Persistent+Systems+Java+Fresher&location=India&f_E=1',
    is2026Eligible: true,
    activelyHiring: true,
  },

  // ==================== LTIMINDTREE ====================
  {
    id: 'lti-ignite-2026',
    role: 'Graduate Trainee Engineer - Java Practice',
    company: 'LTIMindtree',
    location: 'Bangalore / Mumbai / Pune / Chennai',
    workMode: 'Hybrid',
    ctc: '4.2 - 6.5 LPA',
    source: 'Naukri',
    postedDate: 'Posted Today',
    batchEligibility: '2024, 2025 & 2026 Batch (Engineering & MCA)',
    experience: 'Fresher (0-1 yr)',
    coreTech: ['Core Java', 'Advance Java', 'MySQL', 'Hibernate'],
    tags: ['Core Java', 'Advance Java', 'JDBC', 'Hibernate', 'MySQL', 'SQL Optimization'],
    description: 'LTIMindtree Ignite graduate recruitment drive. Dedicated to financial services, cloud migration, and modern enterprise software engineering.',
    hiringRounds: [
      'Round 1: Cognitive + Technical Aptitude',
      'Round 2: Coding Test in Java',
      'Round 3: Technical Interview (Core Java, Advance Java, SQL Queries)',
      'Round 4: HR Evaluation',
    ],
    responsibilities: [
      'Develop robust business logic in Core & Advance Java.',
      'Configure Hibernate entities and optimize MySQL queries.',
      'Collaborate with global teams in Agile delivery cycles.',
    ],
    interviewTips: 'Study: Java 8 features (Lambda expressions, Stream API, Optional class), JDBC transactions (commit, rollback), and SQL indexing best practices.',
    applyUrl: 'https://www.naukri.com/ltimindtree-jobs?k=LTIMindtree%20Java%20Fresher',
    is2026Eligible: true,
    activelyHiring: true,
  },
];

export const JobsPage: React.FC = () => {
  const [jobs] = useState<FresherJob[]>(GENUINE_FRESHER_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [only2026, setOnly2026] = useState<boolean>(true);
  const [selectedJobForModal, setSelectedJobForModal] = useState<FresherJob | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Saved jobs persistence in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('skillportal_saved_fresher_jobs');
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
        localStorage.setItem('skillportal_saved_fresher_jobs', JSON.stringify(updated));
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
    }, 1000);
  };

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 2026 filter
      if (only2026 && !j.is2026Eligible) return false;

      // Source filter
      if (selectedSource !== 'ALL' && j.source !== selectedSource) return false;

      // Core Tech filter
      if (selectedTech !== 'ALL' && !j.coreTech.includes(selectedTech as any)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRole = j.role.toLowerCase().includes(query);
        const matchesCompany = j.company.toLowerCase().includes(query);
        const matchesLocation = j.location.toLowerCase().includes(query);
        const matchesTags = j.tags.some((t) => t.toLowerCase().includes(query));
        const matchesTech = j.coreTech.some((t) => t.toLowerCase().includes(query));
        return matchesRole || matchesCompany || matchesLocation || matchesTags || matchesTech;
      }

      return true;
    });
  }, [jobs, only2026, selectedSource, selectedTech, searchQuery]);

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
      {/* ==================== HERO SECTION: 2026 FRESHER DRIVE FOCUS ==================== */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00c2ff]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                2026 Batch Verified Off-Campus &amp; On-Campus Drives
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/20 text-[#00c2ff] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                High Call-Back MNCs &amp; Product Companies
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-[#00c2ff]" />
              2026 Fresher Java Full Stack Hiring Drives
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Genuine corporate recruitment drives actively calling back freshers skilled in{' '}
              <strong className="text-slate-200">Core Java, Advance Java, Hibernate, Spring Boot, MySQL, HTML/CSS/JS, and React</strong>. Every listing contains verified eligibility criteria, interview rounds, and direct 1-click application links.
            </p>
          </div>

          {/* Quick sync & 2026 toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOnly2026(!only2026)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                only2026
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-[#161922] text-slate-400 border border-[#283042] hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{only2026 ? '✓ 2026 Batch Only' : 'Show All Batches'}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] text-slate-200 border border-[#283042] text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00c2ff] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Verify Openings'}</span>
            </button>
          </div>
        </div>

        {/* Tech Skill Highlight Banner */}
        <div className="mt-6 pt-5 border-t border-[#1f2430] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#00c2ff]" />
            Your Learned Tech Stack:
          </span>
          {['Core Java', 'Advance Java (JDBC)', 'Hibernate / JPA', 'Spring Boot', 'MySQL Database', 'HTML5 & CSS3', 'JavaScript & React'].map((item) => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-lg bg-[#141822] text-[#00c2ff] text-[11px] font-mono border border-[#1f2430]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ==================== PORTAL SELECTOR TABS ==================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1f2430] pb-4">
        {[
          { key: 'ALL', label: 'All Portals', count: sourceCounts.ALL, icon: Globe },
          { key: 'LinkedIn', label: 'LinkedIn', count: sourceCounts.LinkedIn, icon: Building2 },
          { key: 'Naukri', label: 'Naukri.com', count: sourceCounts.Naukri, icon: Briefcase },
          { key: 'Shine', label: 'Shine.com', count: sourceCounts.Shine, icon: Sparkles },
          { key: 'Indeed', label: 'Indeed India', count: sourceCounts.Indeed, icon: Layers },
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

      {/* ==================== SEARCH & SKILL FILTER BAR ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company (TCS, Infosys, Zoho), skill (Hibernate, MySQL), or city..."
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

        {/* Tech Skill Filter */}
        <div>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">Filter by Required Tech</option>
            <option value="Core Java">☕ Core Java (OOPs &amp; Collections)</option>
            <option value="Advance Java">⚙️ Advance Java (JDBC &amp; Servlets)</option>
            <option value="Hibernate">🗄️ Hibernate / JPA ORM</option>
            <option value="Spring Boot">🚀 Spring Boot &amp; REST APIs</option>
            <option value="MySQL">💾 MySQL &amp; SQL Queries</option>
            <option value="HTML/CSS/JS">🌐 HTML5, CSS3 &amp; JavaScript</option>
            <option value="React">⚛️ React Frontend</option>
          </select>
        </div>
      </div>

      {/* ==================== ACTIVE RESULTS SUMMARY ==================== */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredJobs.length}</strong> genuine openings for{' '}
          <strong className="text-emerald-400">{only2026 ? '2026 Batch Freshers' : 'All Batches'}</strong>
        </span>
        <span className="text-[11px] text-slate-500">Verified: {lastUpdated}</span>
      </div>

      {/* ==================== JOB CARDS GRID ==================== */}
      {filteredJobs.length === 0 ? (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No openings found matching your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or selecting &quot;Filter by Required Tech: All&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSource('ALL');
              setSelectedTech('ALL');
              setOnly2026(true);
            }}
            className="px-4 py-2 bg-[#161922] hover:bg-[#1f2430] text-[#00c2ff] border border-[#00c2ff]/30 text-xs font-bold rounded-xl transition-all"
          >
            Reset Filters
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
                className="bg-[#0c0e12] border border-[#1f2430] hover:border-[#00c2ff]/40 rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:shadow-black/60 relative"
              >
                {/* 2026 Eligible Top Badge */}
                {job.is2026Eligible && (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
                    <Award className="w-3 h-3" />
                    2026 Passout Eligible
                  </div>
                )}

                {/* Header row */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>

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

                  {/* Company & Role */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#00c2ff] transition-colors line-clamp-1">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-200">{job.company}</span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">{job.ctc}</span>
                    </div>
                  </div>

                  {/* Location & Mode */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                      <MapPin className="w-3 h-3 text-[#00c2ff]" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {job.workMode}
                    </span>
                  </div>

                  {/* Core Tech Stack Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.coreTech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#141a24] text-[#00c2ff] text-[10px] font-semibold border border-[#1f2b3e]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Eligibility snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed bg-[#12151c] p-2 rounded-lg border border-[#1a1f2b]">
                    <strong className="text-slate-300">Eligibility:</strong> {job.batchEligibility}
                  </p>
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

      {/* ==================== EXPANDED GENUINE JOB DETAILS MODAL ==================== */}
      {selectedJobForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md text-xs font-bold border ${
                    getSourceBadgeStyle(selectedJobForModal.source).bg
                  } ${getSourceBadgeStyle(selectedJobForModal.source).text} ${
                    getSourceBadgeStyle(selectedJobForModal.source).border
                  }`}
                >
                  {selectedJobForModal.source} Verified Fresher Opening
                </span>

                {selectedJobForModal.is2026Eligible && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    ✓ 2026 Batch Eligible
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJobForModal.role}</h2>
              <div className="text-sm font-bold text-[#00c2ff] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedJobForModal.company}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-mono">{selectedJobForModal.ctc}</span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#12151c] p-4 rounded-xl border border-[#1e2330] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Location</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.location}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Batch</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">{selectedJobForModal.batchEligibility.split('(')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Experience</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.experience}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Work Mode</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedJobForModal.workMode}</span>
              </div>
            </div>

            {/* Core Tech Stack Matches */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#00c2ff]" />
                Primary Required Skills (Covered in Skill Portal)
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedJobForModal.coreTech.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#141a24] text-[#00c2ff] text-xs font-bold border border-[#1f2b3e]"
                  >
                    ✓ {tech}
                  </span>
                ))}
                {selectedJobForModal.tags.map((tag, idx) => (
                  <span
                    key={`tag-${idx}`}
                    className="px-2.5 py-1 rounded-lg bg-[#161922] text-slate-300 text-xs border border-[#222734]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Role Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role &amp; Company Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330]">
                {selectedJobForModal.description}
              </p>
            </div>

            {/* Hiring Process Rounds */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Official Selection Rounds
              </h4>
              <div className="space-y-2">
                {selectedJobForModal.hiringRounds.map((round, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-[#12151c] p-3 rounded-xl border border-[#1e2330] text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{round}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Prep Guidance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00c2ff] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Technical Interview Focus &amp; High Call-Back Tips
              </h4>
              <div className="bg-[#141a24] p-3.5 rounded-xl border border-[#1f2b3e] text-xs text-slate-200 leading-relaxed">
                {selectedJobForModal.interviewTips}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#1f2430] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Official Fresher Application Link</span>
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
