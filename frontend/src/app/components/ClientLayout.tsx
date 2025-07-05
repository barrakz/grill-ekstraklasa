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
      <nav className="sticky top-0 bg-primary-bg/95 backdrop-blur-sm z-20 p-4 border-b border-border-color">
        <div className="max-w-4xl mx-auto">
          {/* Mobile navigation */}
          <div className="md:hidden flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                Grill Ekstraklasa
              </Link>
              <div className="flex gap-1.5">
              <Link href="/players" className="text-[11px] md:text-xs hover:text-accent-color py-1 px-1.5">
                Piłkarze
              </Link>
              <Link href="/clubs" className="text-[11px] md:text-xs hover:text-accent-color py-1 px-1.5">
                Kluby
              </Link>
              <Link href="/contact" className="text-[11px] md:text-xs hover:text-accent-color py-1 px-1.5">
                Kontakt
              </Link>
              <Link href="/about" className="text-[11px] md:text-xs hover:text-accent-color py-1 px-1.5">
                O nas
              </Link>
              </div>
            </div>
            <div className="w-full">
              <LoginForm onRegisterClick={() => setShowRegister(true)} />
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
                Grill Ekstraklasa
              </Link>
              <Link href="/players" className="hover:text-accent-color transition-colors">
                Piłkarze
              </Link>
              <Link href="/clubs" className="hover:text-accent-color transition-colors">
                Kluby
              </Link>
              <Link href="/contact" className="hover:text-accent-color transition-colors">
                Kontakt
              </Link>
              <Link href="/about" className="hover:text-accent-color transition-colors">
                O nas
              </Link>
            </div>
            <LoginForm onRegisterClick={() => setShowRegister(true)} />
          </div>
        </div>
      </nav>
      
      {/* Registration Modal - Now at the root level, not in the nav */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#40BFE8] rounded-lg p-6 w-11/12 max-w-sm md:w-96 mx-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Rejestracja</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="btn-sm text-white hover:bg-white/10 hover:text-white text-xl p-1 rounded-full"
              >
                ✕
              </button>
            </div>
            <RegisterForm onSuccess={() => setShowRegister(false)} />
          </div>
        </div>
      )}
      
      {children}
      <footer className="py-8 px-4 text-center opacity-70">
        <p>© 2025 Grill Ekstraklasa. Wszystkie prawa zastrzeżone.</p>
      </footer>
    </>
  );
}