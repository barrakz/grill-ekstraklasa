'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/common/Button';
import InputField from '@/app/components/form/InputField';

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
    } catch {
      setError('Nieprawidłowa nazwa użytkownika lub hasło');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Zalogowany jako {user.username}</span>
        <Button
          onClick={logout}
          size="tiny"
          variant="danger"
        >
          Wyloguj
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
      {/* Mobile form layout (hidden on desktop) */}
      <div className="md:hidden flex flex-col w-full gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Login"
              className="text-sm h-10"
              containerClassName="mb-0"
            />
          </div>
          <div className="flex-1">
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="text-sm h-10"
              containerClassName="mb-0"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="tiny"
            variant="primary"
            className="flex-1 font-medium text-sm"
          >
            Zaloguj
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            size="tiny"
            variant="secondary"
            className="flex-1 font-medium text-sm"
          >
            Zarejestruj
          </Button>
        </div>
      </div>

      {/* Desktop form layout (hidden on mobile) */}
      <div className="hidden md:flex md:flex-row md:items-center md:gap-2">
        <div className="md:w-auto md:mb-0 flex items-center">
          <InputField
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Login"
            className="text-sm h-9 w-28"
            containerClassName="mb-0"
          />
        </div>
        <div className="md:w-auto md:mb-0 flex items-center">
          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            className="text-sm h-9 w-28"
            containerClassName="mb-0"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="tiny"
            variant="primary"
            className="font-medium px-3"
          >
            Zaloguj
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            size="tiny"
            variant="secondary"
            className="font-medium px-3"
          >
            Zarejestruj
          </Button>
        </div>
      </div>

      {error && <p className="text-rose-500 text-center text-xs md:text-sm">{error}</p>}
    </form>
  );
}
