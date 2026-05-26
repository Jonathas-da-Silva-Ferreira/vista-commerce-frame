import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Reusable auth guard for routes that require an authenticated session
 * (checkout, payment, orders, profile). Centralizing this logic guarantees
 * every protected page shares the exact same redirect contract — divergent
 * ad-hoc checks are a classic source of "leaky" private pages.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // useAuth throws outside its provider, so reaching this line guarantees
  // we have a valid context — no defensive null checks needed below.
  const { isAuthenticated } = useAuth();
  // We capture the attempted destination so the LoginPage can bounce the
  // user back after a successful sign-in (Amazon-style "return to" flow).
  const location = useLocation();

  if (!isAuthenticated) {
    // `replace` avoids polluting history: the back button shouldn't
    // resurrect a route the user was never allowed to view.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
