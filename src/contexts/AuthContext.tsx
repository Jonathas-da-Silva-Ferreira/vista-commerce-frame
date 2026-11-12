
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { api } from '@/services/api';

export type AppRole = 'admin' | 'seller' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  name: string;
}

interface AuthSession {
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  roles: AppRole[];
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: (
    redirectPath?: string
  ) => Promise<{ error: string | null }>;
  resetPasswordForEmail: (
    email: string
  ) => Promise<{ error: string | null }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(data: {
  id: string;
  email: string;
  display_name: string;
}): AuthUser {
  const displayName =
    data.display_name || data.email.split('@')[0] || 'User';

  return {
    id: data.id,
    email: data.email,
    displayName,
    name: displayName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore the authenticated user using the saved JWT.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const token = localStorage.getItem('vista_access_token');

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();

        if (!active) return;

        setSession({
          access_token: token,
          token_type: 'bearer',
        });

        setUser(toAppUser(currentUser));
        setRoles(currentUser.roles as AppRole[]);
      } catch (error) {
        // Keep the token if the API is temporarily unavailable.
        // The user can retry when the backend is reachable.
        console.error('Could not restore authentication:', error);

        if (active) {
          setUser(null);
          setSession(null);
          setRoles([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Authenticate using the FastAPI backend.
  const signInWithPassword: AuthContextType['signInWithPassword'] =
    async (email, password) => {
      try {
        const response = await api.loginUser({
          email,
          password,
        });

        setSession({
          access_token: response.access_token,
          token_type: response.token_type,
        });

        setUser(toAppUser(response));
        setRoles(response.roles as AppRole[]);

        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error
            ? error.message
            : 'Login failed.',
        };
      }
    };

  // Register a new customer through FastAPI.
  const signUp: AuthContextType['signUp'] =
    async (email, password, displayName) => {
      try {
        await api.registerUser({
          email,
          password,
          display_name: displayName,
        });

        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error
            ? error.message
            : 'Registration failed.',
        };
      }
    };

  // Google OAuth will be implemented after the basic JWT authentication.
  const signInWithGoogle: AuthContextType['signInWithGoogle'] =
    async () => ({
      error: 'Google authentication is not available yet.',
    });

  // Password recovery endpoints have not been implemented in FastAPI yet.
  const resetPasswordForEmail: AuthContextType['resetPasswordForEmail'] =
    async () => ({
      error: 'Password recovery is not available yet.',
    });

  const updatePassword: AuthContextType['updatePassword'] =
    async () => ({
      error: 'Password update is not available yet.',
    });

  // Remove the JWT and clear the authenticated user.
  const signOut = async () => {
    await api.logoutUser();

    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isAuthenticated: !!user && !!session,
        isAdmin: roles.includes('admin'),
        isSeller: roles.includes('seller'),
        signInWithPassword,
        signUp,
        signInWithGoogle,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
