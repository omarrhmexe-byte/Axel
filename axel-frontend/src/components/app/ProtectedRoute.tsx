/**
 * ProtectedRoute — gate for all /app/* pages.
 * Unauthenticated visitors are redirected to /login,
 * with the original path stored in location.state so login
 * can send them back after sign-in.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Still restoring session from Supabase, show minimal loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <span className="text-stone-700 text-xs font-mono tracking-widest">
          loading...
        </span>
      </div>
    );
  }

  // Not signed in — redirect to login, remember where we came from
  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
