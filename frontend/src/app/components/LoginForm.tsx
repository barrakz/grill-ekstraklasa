'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface LoginFormProps {
  onRegisterClick: () => void;
}

export default function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } catch (error) {
      setError('Nieprawidłowa nazwa użytkownika lub hasło');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Zalogowany jako {user.username}</span>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
        >
          Wyloguj
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
      <div className="flex flex-col w-full md:flex-row md:items-center md:gap-2">
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nazwa użytkownika"
            className="p-3 w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-base"
            style={{ minHeight: "46px" }}
          />
        </div>
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            className="p-3 w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-base"
            style={{ minHeight: "46px" }}
          />
        </div>
        <div className="flex gap-2 w-full">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-medium"
            style={{ minHeight: "46px" }}
          >
            Zaloguj
          </button>
          <button
            type="button"
            onClick={onRegisterClick}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium"
            style={{ minHeight: "46px" }}
          >
            Zarejestruj
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}