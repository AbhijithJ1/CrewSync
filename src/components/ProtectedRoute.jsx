import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute Component
 * Restricts access to authenticated users and specific roles.
 * 
 * - Unauthenticated users -> Redirect to /login
 * - Authorized roles -> Render child components
 * - Unauthorized roles -> Redirect to /dashboard
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.approvalStatus === 'rejected') {
    return <Navigate to="/access-denied" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
