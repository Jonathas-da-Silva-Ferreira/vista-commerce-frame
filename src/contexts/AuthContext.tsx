import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Single source of truth for the signed-in user. Everything else
// (cart ownership, "my orders", reviews) derives identity from here.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Rehydrate from localStorage on mount so a page reload doesn't surprise
  // the user by signing them out.
  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // Corrupt JSON: ignore silently rather than crashing the whole app.
      }
    }
  }, []);

  // Funneling persistence through one helper guarantees React state and
  // storage never drift out of sync — a classic bug source in auth code.
  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('auth_user', JSON.stringify(u));
    else localStorage.removeItem('auth_user');
  };

  // Mock login: a real backend would return a signed token and we'd swap
  // this body out without touching the public API of the provider.
  const login = (email: string, _password: string, name?: string) => {
    const u: User = {
      id: crypto.randomUUID(),
      // Fallback to the local-part of the email so we always have something
      // human-readable to display in the header.
      name: name || email.split('@')[0],
      email,
    };
    persistUser(u);
  };

  // Kept as a distinct method so wiring a real `/register` endpoint later
  // doesn't require changes at every call site.
  const register = (name: string, email: string, _password: string) => {
    const u: User = { id: crypto.randomUUID(), name, email };
    persistUser(u);
  };

  const logout = () => persistUser(null);

  return (
    // `isAuthenticated` is derived, never stored separately, so it cannot
    // get out of sync with `user`.
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Throwing here (vs returning undefined) gives a much clearer error when a
// component is used outside the provider — easier to diagnose than a
// "cannot read property of undefined" crash deep in a child.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
