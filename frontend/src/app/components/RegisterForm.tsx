  'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Nazwa użytkownika i hasło są wymagane');
      return;
    }

    try {
      console.log('Próba rejestracji użytkownika:', username);
      await register(username, password, email);
      console.log('Rejestracja zakończona pomyślnie');
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (error: any) {
      console.error('Registration error details:', error);
      // Jeśli mamy szczegółowy błąd z API, pokaż go użytkownikowi
      if (error.message && error.message.includes('Registration failed:')) {
        try {
          const errorData = JSON.parse(error.message.replace('Registration failed:', '').trim());
          if (errorData.error) {
            setError(`Błąd: ${errorData.error}`);
          } else {
            setError('Wystąpił błąd podczas rejestracji. Sprawdź dane i spróbuj ponownie.');
          }
        } catch (e) {
          setError('Błąd podczas rejestracji. Sprawdź konsolę przeglądarki, aby zobaczyć szczegóły.');
        }
      } else {
        setError('Błąd podczas rejestracji. Sprawdź konsolę przeglądarki, aby zobaczyć szczegóły.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="username" className="block text-xs font-medium mb-1">
          Nazwa użytkownika
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-1">
          Email (opcjonalnie)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-1">
          Hasło
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 mt-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white text-sm"
      >
        Zarejestruj się
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </form>
  );
} 