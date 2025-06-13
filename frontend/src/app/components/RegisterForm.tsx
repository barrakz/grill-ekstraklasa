'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import InputField from '@/app/components/form/InputField';
import Button from '@/app/components/common/Button';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username || !password) {
      setError('Nazwa użytkownika i hasło są wymagane');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(username, password, email);
      setUsername('');
      setPassword('');
      setEmail('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Nazwa użytkownika"
        placeholder="Wpisz nazwę użytkownika"
        required
      />
      
      <InputField
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email (opcjonalnie)"
        placeholder="Wpisz adres email"
      />
      
      <InputField
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Hasło"
        placeholder="Wpisz hasło"
        required
      />
      
      <Button
        type="submit"
        fullWidth
        variant="teal"
        isLoading={isSubmitting}
        className="mt-4"
      >
        Zarejestruj się
      </Button>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}