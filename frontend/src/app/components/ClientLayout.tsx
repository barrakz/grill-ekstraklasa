'use client';

import { useState } from 'react';
import Link from "next/link";
import LoginForm from "./LoginForm";
import RegisterForm from './RegisterForm';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showRegister, setShowRegister] = useState(false);
  
  return (
    <>
      <nav className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          {/* Mobile navigation */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="font-display text-xl font-semibold tracking-tight text-slate-900"
              >
                Grill <span className="text-accent-color">Ekstraklasa</span>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/players" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
                Piłkarze
              </Link>
              <Link href="/clubs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
                Kluby
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
                Kontakt
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
                O nas
              </Link>
            </div>
            <div className="w-full">
              <LoginForm onRegisterClick={() => setShowRegister(true)} />
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex justify-between items-center gap-6">
            <div className="flex gap-6 items-center">
              <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                Grill <span className="text-accent-color">Ekstraklasa</span>
              </Link>
              <Link href="/players" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Piłkarze
              </Link>
              <Link href="/clubs" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Kluby
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Kontakt
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                O nas
              </Link>
            </div>
            <LoginForm onRegisterClick={() => setShowRegister(true)} />
          </div>
        </div>
      </nav>
      
      {/* Registration Modal - Now at the root level, not in the nav */}
      {showRegister && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-11/12 max-w-sm md:w-96 mx-4 relative shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Rejestracja</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="btn-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xl p-1 rounded-full"
              >
                ✕
              </button>
            </div>
            <RegisterForm onSuccess={() => setShowRegister(false)} />
          </div>
        </div>
      )}
      
      {children}
      <footer className="py-8 px-4 text-center text-sm text-slate-500">
        <p>© 2025 Grill Ekstraklasa. Wszystkie prawa zastrzeżone.</p>
      </footer>
    </>
  );
}
