# Reference Portal Analysis — SKILL PORTAL

## 1. Executive Summary & Source Artifacts Inspected

As mandated, before writing any project implementation, the full reference files were thoroughly examined:
- **`Tap Academy _ Training and Placement.html`** (Captured HTML of the main portal shell, announcements, and assignment iframe wrapper).
- **`Tap Academy _ Training and Placement_files/embedded.html`** (1.08 MB source file containing the agentic code editor, Monaco editor layout, problem statement sidebar, test case panels, SVG icons, and theme token structures).
- **Associated CSS bundles**: `index-_ce2kGnO.css` (237 KB), `index-BX5rW96F.css` (165 KB), `code-editor-C85jKWNf.css` (61 KB), `index-B1JadbLt.css` (33 KB), `index-NtFXW1I1.css` (25 KB), `index-Us-UoY2r.css` (9.6 KB), and `index-DsWIu-9P.css` (3 KB).
- **Associated JS bundles**: `index-gIwNciR1.js.download` (4.45 MB) and `index-BWhIeaeC.js.download` (5.45 MB).

---

## 2. Key Observations & UI Patterns

### A. Navigation & Shell Layout
1. **Top Announcement Bar (`_bar_1eew8_2`)**:
   - Marquee-style broadcast bar with customizable announcement text and alert presets.
   - Smooth animation marquee (`--ab-shift`, `--ab-duration`) for maintenance alerts and placement updates.
2. **Left Collapsible Navigation Sidebar (`_student_layout_1dymq_13`)**:
   - Dedicated navigation routes:
     - `/dashboard` (Student Overview, Streaks, Heatmap, Leaderboard)
     - `/courses` (Courses, Subjects, Modules, Topics, Video Lectures, Materials)
     - `/tests` (Timed tests, sections, countdown timer, auto-submit)
     - `/assignments` (Assignment sections, problem list, sequential unlocking)
     - `/company-questions` (Tagged by tech company / difficulty)
     - `/jobs` (Placement alerts and company openings)
     - `/bookmarks` (Saved questions, lessons, and PDFs)
     - `/profile` (Student details, portfolio links, password reset)
     - `/admin` (Admin control panel for content and batch management)
3. **Top Action Header**:
   - Global search input for courses, topics, and question bank.
   - Notification bell with unread badge count and preview dropdown.
   - Dark/Light mode theme switch toggle.
   - Student profile avatar with dropdown menu and secure logout.

### B. Assignment & Question Hierarchy
1. **Assignment Structure**:
   - `Assignment` -> `Assignment Sections` (labeled as "Modules" in the reference) -> `Questions`.
   - Sequential progression: Section 1 unlocked -> complete Section 1 -> Section 2 unlocks.
   - Progress bar, completion counts (e.g. 5/10 solved), points earned vs total points.
2. **Question Details & Agentic Toolbar (`_agentic_toolbar_7ewza_254`)**:
   - Back button returning to section view.
   - Question title ("Prime Subarrays") with difficulty badge (`easy`, `medium`, `hard`).
   - Bookmark button toggle.
   - Navigation controls: "Prev" (Secondary button) and "Next" (Primary brand button).

### C. Coding Question & Monaco Editor Architecture
1. **Split-Pane Layout**:
   - **Left Pane (Problem Statement)**:
     - Description tab: Problem summary, Input Format, Output Format, Constraints, Sample Cases with explicit Input/Output.
     - Submissions tab: Previous student attempts, submission timestamp, execution status (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`), execution runtime (ms) and memory (MB).
   - **Right Top Pane (Monaco Code Editor)**:
     - Language selector dropdown (Java, Python, JavaScript).
     - Starter code boilerplate (`class Main { public static void main(String[] args) ... }`).
     - Action toolbar: Reset Code button, Run button (tests against visible sample cases), Submit button (tests against all hidden cases).
   - **Right Bottom Pane (Test Cases & Results)**:
     - Tab navigation: `Sample Cases`, `Test Cases`, `Custom Cases`, `Test Results`.
     - Individual case tabs (Case 1, Case 2) displaying Input, Expected Output, and Actual Output side-by-side with diff indicators.

### D. Dashboard & Engagement Elements
1. **Learning Continuity ("Resume Learning")**:
   - Prominent card showing last viewed course, module, and topic.
   - Video progress ring (e.g., 65% completed) and single-click "Continue Learning" button.
2. **Activity Heatmap & Streak Tracker**:
   - Annual contribution grid showing daily question and lecture submissions.
   - "Current Streak" and "Longest Streak" count badges with flame icon.
3. **Leaderboard**:
   - Top 3 student podium with points and avatars.
   - Scrollable ranking table with student initials, rank, points, and batch.

---

## 3. What Was Intentionally Redesigned & Enhanced

1. **Original Architecture**:
   - Rather than embedding an external iframe for the code editor, SKILL PORTAL incorporates native Monaco Editor integration directly into the React component tree with seamless theme token synchronization (`@monaco-editor/react`).
2. **Backend Engine**:
   - Replaced any third-party backend with an explicit, high-performance Spring Boot 3 + JDBC engine (no Hibernate/JPA black boxes), making database interactions crystal clear for learning and production maintenance.
3. **Server-Authoritative Test Timer**:
   - Rather than relying on client-side clocks, the test timer is strictly enforced on the server (`deadline = started_at + duration`). Any late submission triggers automatic grading.
4. **Clean Decoupled Execution**:
   - Built a secure sandbox execution abstraction (`MockExecutor` for local dev; containerized execution for production), protecting the Spring Boot server from arbitrary code execution.

---

## 4. Private & Vendor Content Excluded

To ensure 100% originality, privacy, and security, the following were strictly excluded:
- All real student names, roll numbers, and contact details from the reference.
- Third-party tracking and analytics scripts (Google Tag Manager `GTM-T94P3PM`, Google Analytics `G-GB0G6YL9LX`, Zoho SalesIQ float widgets).
- Proprietary CDN asset URLs and logos.
- Internal authorization cookies, bearer tokens, and session identifiers.

All data in SKILL PORTAL is populated using realistic, educational demo datasets.
