'use client';

import Link from "next/link";
import LoginForm from "./LoginForm";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Grill Ekstraklasa
            </Link>
            <Link href="/players" className="hover:opacity-80">
              Piłkarze
            </Link>
            <Link href="/clubs" className="hover:opacity-80">
              Kluby
            </Link>
          </div>
          <LoginForm />
        </div>
      </nav>
      {children}
      <footer className="py-8 text-center opacity-70">
        <p>© 2024 Grill Ekstraklasa. Wszystkie prawa zastrzeżone.</p>
      </footer>
    </>
  );
} 