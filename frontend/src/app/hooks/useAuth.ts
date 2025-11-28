'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Przeważnie nie będziemy potrzebować pełnego URL, ponieważ zapytania będą kierowane przez Next.js
  // Przeważnie nie będziemy potrzebować pełnego URL, ponieważ zapytania będą kierowane przez Next.js

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Login failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      const userData = {
        id: data.user_id,
        username: username,
        token: data.token,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      const response = await fetch(`/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Registration failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      const userData = {
        id: data.user_id,
        username: data.username,
        token: data.token,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
} 