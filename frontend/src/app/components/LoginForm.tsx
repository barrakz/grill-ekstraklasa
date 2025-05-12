'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import RegisterForm from './RegisterForm';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { login, user, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } catch (err) {
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
    <>
      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nazwa użytkownika"
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło"
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white"
        >
          Zaloguj
        </button>
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Zarejestruj
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>

      {/* Modal rejestracji */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#40BFE8] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Rejestracja</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <RegisterForm />
          </div>
        </div>
      )}
    </>
  );
} 