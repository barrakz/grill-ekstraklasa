'use client';


import { useAuth } from '@/app/hooks/useAuth';

export default function ContactPage() {
  // Hook do autoryzacji - inicjalizuje się automatycznie, nie musimy wywoływać dodatkowych metod
  // Hook do autoryzacji - inicjalizuje się automatycznie, nie musimy wywoływać dodatkowych metod
  useAuth();

  return (
    <main className="flex min-h-screen flex-col px-4">
      <div className="max-w-4xl mx-auto py-8 md:py-12 w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Kontakt</h1>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Skontaktuj się z nami</h2>

          <p className="mb-6">
            Masz pytania, sugestie lub uwagi dotyczące portalu Grill Ekstraklasa?
            Jesteśmy otwarci na wszelkie formy kontaktu i chętnie odpowiemy na Twoje pytania.
          </p>

          <div className="bg-accent-color/10 border border-accent-color/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-3 text-accent-color">E-mail</h3>
            <p className="text-lg">
              <a href="mailto:kontakt@grillekstraklasa.pl" className="text-accent-color hover:underline">
                kontakt@grillekstraklasa.pl
              </a>
            </p>
          </div>

          {/* Usunięto sekcję O portalu, bo jest teraz w O nas */}
        </div>
      </div>
    </main>
  );
}
