import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { TopicViewPage } from './pages/TopicViewPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AssignmentDetailPage } from './pages/AssignmentDetailPage';
import { CodingWorkspacePage } from './pages/CodingWorkspacePage';
import { TestsPage } from './pages/TestsPage';
import { TestWorkspacePage } from './pages/TestWorkspacePage';
import { TestResultPage } from './pages/TestResultPage';
import { AttendancePage } from './pages/AttendancePage';
import { MaterialsPage } from './pages/MaterialsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CompanyQuestionsPage } from './pages/CompanyQuestionsPage';
import { JobsPage } from './pages/JobsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Student Portal Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="topics/:id" element={<TopicViewPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="assignments/:id" element={<AssignmentDetailPage />} />
              <Route path="company-questions" element={<CompanyQuestionsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="coding" element={<CodingWorkspacePage />} />
              <Route path="tests" element={<TestsPage />} />
              <Route path="tests/:id/workspace" element={<TestWorkspacePage />} />
              <Route path="tests/:id/result/:attemptId" element={<TestResultPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Admin Portal */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
