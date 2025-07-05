import React from "react";

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">O nas</h1>
      <p className="mb-2">
        „Grill Ekstraklasa” to niezależna, fanowska aplikacja o charakterze społecznościowym, niepowiązana w żaden sposób z Ekstraklasa S.A. ani oficjalnymi strukturami polskiej ligi piłkarskiej.
      </p>
      <p className="mb-2">
        Celem serwisu jest stworzenie przestrzeni do swobodnej wymiany opinii i ocen piłkarzy występujących w Ekstraklasie — tworzonej przez kibiców, dla kibiców.
      </p>
      <p className="mb-2">
        Wszelkie wypowiedzi i oceny publikowane w serwisie stanowią wyłącznie poglądy ich autorów.
      </p>
      <p className="text-sm text-gray-500 mt-8">&copy; {new Date().getFullYear()} Grill Ekstraklasa</p>
    </main>
  );
}
