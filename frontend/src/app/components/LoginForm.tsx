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
    } catch (error) {
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
              className="text-sm"
              style={{ height: "38px" }}
            />
          </div>
          <div className="flex-1">
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="text-sm"
              style={{ height: "38px" }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="tiny"
            variant="teal"
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
        <div className="md:w-auto md:mb-0 flex items-center" style={{ alignItems: "flex-end" }}>
          <InputField
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Login"
            className="text-sm"
            style={{ minWidth: "80px", maxWidth: "100px", width: "100px", height: "28px", fontSize: "0.85rem", borderRadius: "6px", border: "1.5px solid #3b4252", boxSizing: "border-box", padding: "0.25rem 0.5rem", background: "#111827", color: "#e5e7eb", marginTop: "16px" }}
          />
        </div>
        <div className="md:w-auto md:mb-0 flex items-center" style={{ alignItems: "flex-end" }}>
          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            className="text-sm"
            style={{ minWidth: "80px", maxWidth: "100px", width: "100px", height: "28px", fontSize: "0.85rem", borderRadius: "6px", border: "1.5px solid #3b4252", boxSizing: "border-box", padding: "0.25rem 0.5rem", background: "#111827", color: "#e5e7eb", marginTop: "16px" }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="tiny"
            variant="teal"
            className="font-medium px-2"
            style={{ minWidth: "60px", fontSize: "0.85rem", height: "28px" }}
          >
            Zaloguj
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            size="tiny"
            variant="secondary"
            className="font-medium px-2"
            style={{ minWidth: "70px", fontSize: "0.85rem", height: "28px" }}
          >
            Zarejestruj
          </Button>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-center text-xs md:text-sm">{error}</p>}
    </form>
  );
}