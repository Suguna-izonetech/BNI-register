import { useState, useCallback } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));

  const login = useCallback((t: string) => {
    localStorage.setItem('admin_token', t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
  }, []);

  return { token, isAuthenticated: !!token, login, logout };
}
