'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { getDashboardPath } from '@/lib/auth';
import type { LoginPayload, StrapiUser } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
  user: StrapiUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StrapiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const res = await axios.post('/api/auth/login', payload);
      const data = res.data;
      setUser(data.user);
      router.push(getDashboardPath(data.user.role_type));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/me'); // POST = logout
    } catch (error) {}
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
