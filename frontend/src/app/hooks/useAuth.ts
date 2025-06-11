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
  const API_BASE_URL = "";

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Trying to login via API');
      
      const response = await fetch(`/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error data:', errorData);
        throw new Error(`Login failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      
      const userData = {
        id: data.user_id,
        username: username,
        token: data.token,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      console.log('Trying to register via API');
      
      const response = await fetch(`/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email }),
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration error data:', errorData);
        throw new Error(`Registration failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Registration successful, received data:', data);
      
      const userData = {
        id: data.user_id,
        username: data.username,
        token: data.token,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
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