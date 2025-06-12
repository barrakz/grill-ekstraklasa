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
    <>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nazwa użytkownika"
          className="p-2 w-full md:w-auto rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-base"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło"
          className="p-2 w-full md:w-auto rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-base"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <button
            type="submit"
            className="flex-1 md:flex-none px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white text-sm md:text-base"
          >
            Zaloguj
          </button>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm md:text-base"
          >
            Zarejestruj
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>

      {/* Modal rejestracji */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#40BFE8] rounded-lg p-4 max-w-xs sm:max-w-sm md:max-w-md w-full mx-auto my-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Rejestracja</h2>
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