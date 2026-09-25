# SKILL PORTAL — Production-Grade Learning & Assessment System

A modern, full-stack Student Learning Management, Algorithmic Coding Practice, and Timed Assessment Portal inspired by professional enterprise training platforms.

---

## 🌟 Key Architecture & Engineering Principles

1. **Zero-JPA / Pure JdbcTemplate Backend:**
   - Strict adherence to explicit, high-performance SQL queries via Spring `JdbcTemplate` and `NamedParameterJdbcTemplate`.
   - No opaque Hibernate session flushes, N+1 query surprises, or unexpected dirty checking.
   - Explicit database schema lifecycle managed via Flyway versioned migrations (`V1__init_schema.sql`, `V2__seed_demo_data.sql`).

2. **Decoupled Code Execution Sandbox:**
   - `CodeExecutionEngine` interface with a pluggable `MockExecutor` simulator (and Docker sandbox-ready contract).
   - Prevents student-submitted code from executing directly within the Spring Boot JVM.
   - Evaluates visible sample cases with detailed input/expected/actual diffs, and grades hidden edge cases without exposing solution vectors.

3. **Sequential Section Locking:**
   - Multi-section assignment labs enforce mastery prerequisites.
   - Students cannot access Section $(N+1)$ until 100% of questions in Section $N$ have been solved.

4. **Server-Authoritative Timed Assessments:**
   - Test duration and deadlines are strictly computed and enforced on the backend.
   - Real-time countdown clock in the UI with auto-submission trigger upon deadline expiration.
   - Question options are securely stripped of `is_correct` answers during active sessions; answers are only evaluated upon server submission.

5. **Split-Screen Monaco Code Editor:**
   - Full LeetCode-style split interface with syntax highlighting, bracket matching, language switching (Java, Python, JavaScript), dark/light theme options, and custom input console.

6. **Interactive Activity Heatmap & Leaderboard Podium:**
   - 365-day GitHub-style activity contribution calendar with dynamic intensity levels.
   - Real-time batch leaderboard with Gold/Silver/Bronze podium ranking.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java:** JDK 21 or 23
- **Maven:** 3.8+
- **Node.js:** v18+ (tested on Node v23.11.0 / npm 11.5.2)
- **MySQL:** 8.0 running locally on port `3306`

### 1. Database Setup
Ensure MySQL is running on `localhost:3306`. The schema and demo data are automatically applied via Flyway on backend startup:
```sql
CREATE DATABASE IF NOT EXISTS skill_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run Backend (Spring Boot 3.3.4)
```powershell
cd skill-portal/backend
mvn clean package -DskipTests
java -jar target/skill-portal-backend-1.0.0-SNAPSHOT.jar
```
*Backend runs on: `http://localhost:8080`*
*Swagger / OpenAPI Docs: `http://localhost:8080/swagger-ui.html`*

### 3. Run Frontend (React + TypeScript + Vite)
```powershell
cd skill-portal/frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000` (with built-in reverse proxy to backend port 8080)*

---

## 🔑 Demo Accounts & Credentials

| Role | Email / Identifier | Password | Student ID Number |
| :--- | :--- | :--- | :--- |
| **Student** | `student@skillportal.com` | `Student@123` | `STU-2026-001` (Shiva Kumar) |
| **Student** | `rahul.k@skillportal.com` | `Student@123` | `STU-2026-002` (Rahul Sharma) |
| **Admin** | `admin@skillportal.com` | `Admin@123` | *N/A* (System Administrator) |

*Tip: The login page includes one-click demo filler buttons for instant access!*

---

## 📂 Project Directory Structure

```
skill-portal/
├── backend/
│   ├── src/main/java/com/skillportal/
│   │   ├── admin/             # Admin cohort analytics & student roster
│   │   ├── assignment/        # Sequential section locking & labs
│   │   ├── attendance/        # Attendance sessions & verified registers
│   │   ├── auth/              # JWT auth, refresh rotation, login
│   │   ├── bookmark/          # Question & lesson bookmarking
│   │   ├── coding/            # Monaco runner, submitter, MockExecutor
│   │   ├── common/            # API response wrappers & pagination
│   │   ├── config/            # Security, CORS, Swagger OpenAPI
│   │   ├── course/            # Courses, subjects, modules, topics
│   │   ├── dashboard/         # Heatmap, streak, podium, resume learning
│   │   ├── exception/         # Global exception handler & error DTOs
│   │   ├── material/          # Study guides, cheat sheets, slides
│   │   ├── notification/      # Announcements & marquee banner events
│   │   ├── question/          # MCQ options & scoring
│   │   ├── security/          # JWT filters & UserDetailsService
│   │   ├── test/              # Timed assessments & auto-grading
│   │   ├── user/              # Student profile & password reset
│   │   └── video/             # Video progress synchronization
│   └── src/main/resources/db/migration/
│       ├── V1__init_schema.sql # 36 normalized MySQL tables
│       └── V2__seed_demo_data.sql # Full realistic curriculum & users
├── frontend/
│   ├── src/
│   │   ├── api/client.ts      # Axios with JWT & 401 auto-refresh rotation
│   │   ├── components/
│   │   │   ├── common/        # Badges, Spinners, Empty States
│   │   │   └── layout/        # Navbar, Sidebar, AppShell, Marquee
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   ├── TopicViewPage.tsx
│   │   │   ├── AssignmentsPage.tsx
│   │   │   ├── AssignmentDetailPage.tsx
│   │   │   ├── CodingWorkspacePage.tsx
│   │   │   ├── TestsPage.tsx
│   │   │   ├── TestWorkspacePage.tsx
│   │   │   ├── TestResultPage.tsx
│   │   │   ├── AttendancePage.tsx
│   │   │   ├── MaterialsPage.tsx
│   │   │   ├── BookmarksPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── AdminDashboardPage.tsx
│   │   ├── types/index.ts     # TypeScript DTO schemas
│   │   ├── App.tsx            # Protected routing
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── ARCHITECTURE.md
│   └── REFERENCE_ANALYSIS.md
├── docker-compose.yml
├── render.yaml               # 1-Click Free Cloud Blueprint (Render.com)
└── frontend/vercel.json      # Free Vercel SPA Routing Configuration
```

---

## 🌐 Free Cloud Deployment & Sharing Guide (Mobile & Laptop Ready)

You can deploy and host this entire system **100% free** so anyone can use it on their phone, tablet, or laptop from anywhere in the world!

### Step 1: Push Code to Your GitHub
```bash
# 1. Stage all files
git add .

# 2. Create your commit
git commit -m "feat: complete skill portal with obsidian theme, youtube video player, and cloud deployment ready"

# 3. Create a new repository on https://github.com/new (e.g. 'skill-portal')

# 4. Link to your GitHub repo and push
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/skill-portal.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Frontend on Vercel (100% Free Forever)
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your GitHub repository `skill-portal`.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://<your-backend-service>.onrender.com` (your backend URL)
5. Click **Deploy**!
   > 🚀 Vercel will instantly generate a free HTTPS link (e.g., `https://skill-portal-alpha.vercel.app`) that works on both laptop and mobile browsers worldwide!

---

### Step 3: Deploy Backend on Render.com (100% Free Tier)
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **"New +"** -> **"Web Service"**.
3. Connect your `skill-portal` repository.
4. Settings:
   - **Name**: `skill-portal-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (or Java)
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, configure:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://<your-free-mysql-host>:3306/skill_portal?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`
   - `SPRING_DATASOURCE_USERNAME` = `<your-db-user>`
   - `SPRING_DATASOURCE_PASSWORD` = `<your-db-password>`
   - `JWT_SECRET` = `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
   - `CORS_ALLOWED_ORIGINS` = `*`
6. Click **Create Web Service**!

---

### Step 4: Free Cloud MySQL Database (100% Free Tier)
Choose any free cloud MySQL provider:
- **[Aiven.io](https://aiven.io)** (Free forever MySQL 8 tier)
- **[TiDB Cloud](https://tidbcloud.com)** (Free Serverless MySQL compatible tier)
- **[Railway.app](https://railway.app)** (Free starter credit MySQL)

Copy your connection string parameters and set them into the Render backend environment variables. The Flyway database migration will automatically run and populate all tables and demo courses upon the first launch!

---

### 📱 Responsive Mobile & Laptop Experience
The portal is fully optimized with Tailwind CSS responsive design:
- **Mobile Phones**: Responsive touch navigation drawer, stacked card carousels, full-width YouTube video players, and touch-friendly MCQ selections.
- **Laptops & Desktops**: Split-screen Monaco code editor, 12-month green activity heatmap, 3D podium leaderboards, 6-column course cards, and full-height navigation sidebar.

