import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
// Student Pages
import StudentProfile from './pages/student/Profile.jsx';
import StudentJobs from './pages/student/Jobs.jsx';
import StudentApplications from './pages/student/Applications.jsx';
// PO Pages
import PODashboard from './pages/po/Dashboard.jsx';
import POCompanies from './pages/po/Companies.jsx';
import POJobs from './pages/po/Jobs.jsx';
import POApplicants from './pages/po/Applicants.jsx';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';

// Route Guard - Requires Authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route Guard - Restricts roles
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to user's main path if unauthorized
    const defaultPaths = {
      student: '/student/profile',
      po: '/po',
      admin: '/admin',
    };
    return <Navigate to={defaultPaths[user?.role] || '/login'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Fallback routing */}
            <Route index element={<Navigate to="/login" replace />} />

            {/* Student Endpoints */}
            <Route
              path="student/profile"
              element={
                <RoleGuard allowedRoles={['student']}>
                  <StudentProfile />
                </RoleGuard>
              }
            />
            <Route
              path="student/jobs"
              element={
                <RoleGuard allowedRoles={['student']}>
                  <StudentJobs />
                </RoleGuard>
              }
            />
            <Route
              path="student/applications"
              element={
                <RoleGuard allowedRoles={['student']}>
                  <StudentApplications />
                </RoleGuard>
              }
            />

            {/* Placement Officer Endpoints */}
            <Route
              path="po"
              element={
                <RoleGuard allowedRoles={['po']}>
                  <PODashboard />
                </RoleGuard>
              }
            />
            <Route
              path="po/companies"
              element={
                <RoleGuard allowedRoles={['po']}>
                  <POCompanies />
                </RoleGuard>
              }
            />
            <Route
              path="po/jobs"
              element={
                <RoleGuard allowedRoles={['po']}>
                  <POJobs />
                </RoleGuard>
              }
            />
            <Route
              path="po/applicants/:jobId"
              element={
                <RoleGuard allowedRoles={['po']}>
                  <POApplicants />
                </RoleGuard>
              }
            />

            {/* Admin Endpoints */}
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="admin/users"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="admin/departments"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
