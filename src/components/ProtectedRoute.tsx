import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  // Optional role gate — empty/undefined means "any signed-in user".
  // Why a list: an admin route can be opened to admins only, while a
  // seller-or-admin route just adds 'admin' to the array.
  requireRoles?: Array<'admin' | 'seller' | 'customer'>;
}

/**
 * Single source of truth for route protection. Two redirect contracts:
 *  - Not authenticated → /login (with `from` so we bounce back after login).
 *  - Authenticated but wrong role → / (homepage). We do NOT leak the
 *    target URL to the login form because that would imply they can reach
 *    it with the right credentials, which is misleading for missing roles.
 */
export default function ProtectedRoute({ children, requireRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, roles } = useAuth();
  const location = useLocation();

  // Block rendering until the session rehydrates. Without this, the very
  // first paint after F5 redirects a real user to /login because the
  // session hasn't been restored from storage yet.
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRoles && requireRoles.length > 0) {
    const ok = requireRoles.some((r) => roles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
