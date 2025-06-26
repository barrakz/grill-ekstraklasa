import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "Grill Ekstraklasa – Oceniaj i komentuj wszystkich piłkarzy Ekstraklasy",
  description: "Portal kibiców Ekstraklasy, w którym możesz oceniać zawodników, dodawać komentarze i śledzić rankingi piłkarzy wszystkich klubów ligi. Interaktywna platforma dla fanów polskiej piłki.",
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
    <html lang="pl">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
