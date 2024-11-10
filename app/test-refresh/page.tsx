"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TestRefreshPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get("/auth/me");
        console.log("Requisição bem sucedida:", response.data);
        setCount((prev) => prev + 1);
      } catch (error) {
        console.log("Erro na requisição:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <p>Requisições feitas: {count}</p>
    </div>
  );
}
