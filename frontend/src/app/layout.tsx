import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css"; // jeśli masz Tailwind lub inne globalne style

export const metadata: Metadata = {
  title: "Grill Ekstraklasa - Oceniaj Piłkarzy",
  description: "Najprostsza aplikacja do oceniania piłkarzy Ekstraklasy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <nav className="p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">Grill Ekstraklasa</Link>
            <div className="flex gap-4">
              <Link href="/players" className="hover:opacity-80">Piłkarze</Link>
              <Link href="/clubs" className="hover:opacity-80">Kluby</Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="py-8 text-center opacity-70">
          <p>© 2024 Grill Ekstraklasa. Wszystkie prawa zastrzeżone.</p>
        </footer>
      </body>
    </html>
  );
}
