"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

export default function VerifyLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) {
      !token && router.replace("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        // Importante: Use o client API configurado
        const response = await api.get(`/auth/verify-login?token=${token}`);

        // Garante que o login é chamado com os dados corretos
        if (response.data?.user) {
          login(response.data.user);
          setStatus("success");
          setMessage(response.data.message || "Login realizado com sucesso!");

          // Aguarda um pouco mais antes de redirecionar
          setTimeout(() => {
            router.replace("/"); // Alterado para redirecionar para a raiz
          }, 3000);
        } else {
          throw new Error("Dados do usuário não recebidos");
        }
      } catch (error: any) {
        console.error("Erro na verificação:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Erro ao verificar token"
        );
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      }
    };

    verificationAttempted.current = true;
    verifyToken();
  }, [token, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <h1
          className={`text-2xl font-bold mb-4 ${
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-green-600"
              : "text-gray-600"
          }`}
        >
          {status === "loading"
            ? "Verificando..."
            : status === "success"
            ? "✅ Sucesso!"
            : "❌ Erro"}
        </h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
