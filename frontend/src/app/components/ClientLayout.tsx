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
          <div className="md:hidden flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent text-center">
                Grill Ekstraklasa
              </Link>
              <div className="w-full">
                <LoginForm onRegisterClick={() => setShowRegister(true)} />
              </div>
            </div>
            <div className="flex justify-around pt-2">
              <Link href="/players" className="flex items-center gap-1 hover:text-accent-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Piłkarze
              </Link>
              <Link href="/clubs" className="flex items-center gap-1 hover:text-accent-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                Kluby
              </Link>
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
                className="text-white hover:bg-white/10 hover:text-white text-xl p-2 rounded-full"
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
        <p>© 2024 Grill Ekstraklasa. Wszystkie prawa zastrzeżone.</p>
      </footer>
    </>
  );
}