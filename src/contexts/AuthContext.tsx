import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User as SupaUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Why a dedicated AppRole union instead of `string`:
// every guard in the app branches on these exact values; widening to
// `string` would let typos pass typecheck and silently break access control.
export type AppRole = 'admin' | 'seller' | 'customer';

export interface AuthUser {
  id: string;            // auth.users.id (UUID) — used as foreign key everywhere
  email: string;         // primary identifier shown in UI
  displayName: string;   // friendly label for headers/avatars
  // `name` is a back-compat alias used by legacy storefront components.
  // Kept in sync with displayName so refactor can be incremental.
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  roles: AppRole[];
  // `loading` MUST be checked by guards before redirecting; otherwise a
  // signed-in user is briefly thrown to /login while the session rehydrates.
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  // `redirectPath` is remembered so the OAuth full-page redirect can return
  // the user to the page they were originally trying to access.
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  // Sends a Supabase password-reset email. The link lands on /reset-password
  // where updatePassword() finishes the flow.
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // `logout` is a back-compat alias for legacy callers (e.g. Header).
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maps a Supabase auth user into the shape the rest of the app consumes.
// Centralizing the mapping keeps the SDK type contained to this module.
function toAppUser(u: SupaUser): AuthUser {
  const displayName =
    (u.user_metadata?.display_name as string | undefined) ??
    (u.email ? u.email.split('@')[0] : 'User');
  return {
    id: u.id,
    email: u.email ?? '',
    displayName,
    name: displayName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Why this exact pattern (subscribe THEN getSession):
  // Supabase guidance — registering the listener first guarantees we don't
  // miss the SIGNED_IN event that fires during the initial session refresh.
  // We deliberately avoid awaiting Supabase calls inside the listener to
  // prevent deadlocks documented in the SDK.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ? toAppUser(newSession.user) : null);

      if (newSession?.user) {
        // Defer the role fetch with setTimeout(0) so the auth listener
        // returns synchronously — pattern recommended to avoid SDK deadlocks.
        setTimeout(() => { void loadRoles(newSession.user.id); }, 0);

        // OAuth full-page redirect returns the user to `/`. If we stashed
        // an intended destination before signInWithGoogle(), honor it now
        // that the session is live. Skip during PASSWORD_RECOVERY so the
        // reset-password page keeps control of its own flow.
        if (event === 'SIGNED_IN') {
          try {
            const target = sessionStorage.getItem('auth:redirectAfter');
            if (target && target !== window.location.pathname) {
              sessionStorage.removeItem('auth:redirectAfter');
              window.history.replaceState({}, '', target);
            } else if (target) {
              sessionStorage.removeItem('auth:redirectAfter');
            }
          } catch { /* storage disabled */ }
        }
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ? toAppUser(existing.user) : null);
      if (existing?.user) void loadRoles(existing.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Roles live in their own table so users can never escalate themselves
  // by editing their profile. We fetch every assigned role because a user
  // may simultaneously be both a seller and an admin.
  const loadRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (!error && data) setRoles(data.map((r) => r.role as AppRole));
  };

  const signInWithPassword: AuthContextType['signInWithPassword'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthContextType['signUp'] = async (email, password, displayName) => {
    // emailRedirectTo is REQUIRED so the confirmation link returns the
    // user to this app instead of Supabase's default landing page.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle: AuthContextType['signInWithGoogle'] = async (redirectPath) => {
    // Lovable's managed OAuth wrapper exchanges the OAuth tokens for a
    // Supabase session under the hood, so callers don't deal with PKCE.
    // We persist the intended post-login path in sessionStorage BEFORE the
    // full-page redirect happens — after Google bounces the user back to
    // window.location.origin, AuthContext reads and clears it to navigate.
    if (redirectPath && redirectPath !== '/') {
      try { sessionStorage.setItem('auth:redirectAfter', redirectPath); } catch { /* storage disabled */ }
    }
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('google', {
      // Must be a public same-origin URL, NOT a protected route — the
      // wrapper needs to set the session before the app guards evaluate.
      redirect_uri: window.location.origin,
    });
    return { error: result.error ? String(result.error.message ?? result.error) : null };
  };

  // Password reset: Supabase sends an email whose link contains a recovery
  // token. Landing that token on /reset-password lets updateUser() apply
  // the new password without ever exposing the token to our own backend.
  const resetPasswordForEmail: AuthContextType['resetPasswordForEmail'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword: AuthContextType['updatePassword'] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isAuthenticated: !!session,
        isAdmin: roles.includes('admin'),
        isSeller: roles.includes('seller'),
        signInWithPassword,
        signUp,
        signInWithGoogle,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        // Alias kept so existing Header/menus continue to work unchanged.
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Throwing (vs returning undefined) gives a clear error if a component
// renders outside the provider — much easier to debug than a null crash.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
