import Link from "next/link";
import "./globals.css"; // jeśli masz Tailwind lub inne globalne style

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-100 text-gray-900">
        <header className="bg-white shadow-md py-4">
          <nav className="container mx-auto flex justify-between px-4">
            <Link href="/" className="text-xl font-bold">
              Grill Ekstraklasa
            </Link>
            <div className="space-x-4">
              <Link href="/players" className="hover:underline">
                Piłkarze
              </Link>
              <Link href="/about" className="hover:underline">
                O nas
              </Link>{" "}
              {/* Opcjonalnie */}
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">{children}</main>

        <footer className="text-center py-4 text-gray-500">
          © 2024 Grill Ekstraklasa
        </footer>
      </body>
    </html>
  );
}
