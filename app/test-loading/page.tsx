"use client";

import { useEffect, useState } from "react";
import Loading from "../loading";

function TestLoadingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula um delay de 3 segundos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Página carregada com sucesso!</h1>
    </div>
  );
}

export default TestLoadingPage;
