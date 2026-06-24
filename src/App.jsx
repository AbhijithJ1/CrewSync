import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './layouts/AppShell';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardPage from './pages/DashboardPage';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import ProfilePage from './pages/ProfilePage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ApprovalManagementPage from './pages/ApprovalManagementPage';
import ChatPage from './pages/ChatPage';

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
      />

      {/* Access Control Status Screens */}
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Role Selection Portal */}
      <Route 
        path="/role-selection" 
        element={
          <ProtectedRoute>
            <RoleSelectionPage />
          </ProtectedRoute>
        } 
      />

      {/* Protected Dashboards (with Layout Shell) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      {/* Organizer Pages */}
      <Route 
        path="/create-task" 
        element={
          <ProtectedRoute allowedRole="organizer">
            <AppShell>
              <CreateTaskPage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/approvals" 
        element={
          <ProtectedRoute allowedRole="organizer">
            <AppShell>
              <ApprovalManagementPage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/volunteers" 
        element={
          <ProtectedRoute allowedRole="organizer">
            <AppShell>
              <DashboardPage screen="volunteers" />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      {/* Volunteer Pages */}
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute allowedRole="volunteer">
            <AppShell>
              <DashboardPage screen="tasks" />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      {/* General Role Protected Pages */}
      <Route 
        path="/task/:id" 
        element={
          <ProtectedRoute>
            <AppShell>
              <TaskDetailsPage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AppShell>
              <ProfilePage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <AppShell>
              <ChatPage />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--r-md)',
              fontSize: '13px',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-lg)',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: 'var(--text-primary)',
                secondary: 'var(--bg-elevated)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--text-primary)',
                secondary: 'var(--bg-elevated)',
              },
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  );
}
