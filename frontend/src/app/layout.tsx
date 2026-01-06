import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grill Ekstraklasa – Oceniaj i komentuj wszystkich piłkarzy Ekstraklasy",
  description: "Portal kibiców Ekstraklasy, w którym możesz oceniać zawodników, dodawać komentarze i śledzić rankingi piłkarzy wszystkich klubów ligi. Interaktywna platforma dla fanów polskiej piłki.",
  keywords: "Ekstraklasa, piłkarze, oceny, rankingi, komentarze, polska piłka, kluby, zawodnicy",
  authors: [{ name: "Grill Ekstraklasa" }],
  openGraph: {
    title: "Grill Ekstraklasa – Oceniaj piłkarzy Ekstraklasy",
    description: "Portal kibiców Ekstraklasy z ocenami zawodników i komentarzami",
    url: "https://grillekstraklasa.pl",
    siteName: "Grill Ekstraklasa",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grill Ekstraklasa – Oceniaj piłkarzy Ekstraklasy",
    description: "Portal kibiców Ekstraklasy z ocenami zawodników",
  },
  alternates: {
    canonical: "https://grillekstraklasa.pl/",
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
