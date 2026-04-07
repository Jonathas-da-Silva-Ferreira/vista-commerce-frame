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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado centralizado do usuário — único ponto de verdade para autenticação em toda a app
  const [user, setUser] = useState<User | null>(null);

  // Reidrata sessão do localStorage ao montar o provider,
  // evitando logout indesejado ao recarregar a página
  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* JSON corrompido — trata silenciosamente para não quebrar a app */ }
    }
  }, []);

  // Centraliza persistência para garantir que estado React e localStorage
  // estejam sempre sincronizados — evita bugs de dados inconsistentes
  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('auth_user', JSON.stringify(u));
    else localStorage.removeItem('auth_user');
  };

  // Login simplificado (mock): gera UUID no client para simular backend.
  // Em produção, substituir por chamada à API que retorna token JWT
  const login = (email: string, _password: string, name?: string) => {
    const u: User = {
      id: crypto.randomUUID(),
      // Fallback para parte antes do @ — garante que o usuário sempre tenha um nome visível
      name: name || email.split('@')[0],
      email,
    };
    persistUser(u);
  };

  // Registro separado do login para manter contratos de API distintos,
  // facilitando futura integração com backend real (endpoints diferentes)
  const register = (name: string, email: string, _password: string) => {
    const u: User = { id: crypto.randomUUID(), name, email };
    persistUser(u);
  };

  const logout = () => persistUser(null);

  return (
    // isAuthenticated derivado de user — evita estado duplicado que poderia
    // ficar dessincronizado (ex: user=null mas isAuthenticated=true)
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado com validação de contexto — lança erro explícito
// ao invés de retornar undefined, facilitando debug para o desenvolvedor
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
