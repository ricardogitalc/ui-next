"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify/${params.token}`,
          {
            validateStatus: null, // Permite capturar todos os status HTTP
            timeout: 10000, // 10 segundos timeout
          }
        );

        setStatus("success");
        setMessage("Email verificado com sucesso! Redirecionando...");

        setTimeout(() => {
          router.push("/login");
        }, 9000);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            `Erro ao verificar email (${error.response?.status || "unknown"})`
        );
      }
    };

    verifyEmail();
  }, [params.token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        {status === "loading" && (
          <>
            <div className="animate-pulse">Verificando seu email...</div>
            <div className="text-sm text-gray-500">Token: {params.token}</div>
          </>
        )}

        {status === "success" && (
          <div className="text-green-600 space-y-2">
            <h2 className="text-xl font-semibold">✅ {message}</h2>
          </div>
        )}

        {status === "error" && (
          <div className="text-red-600 space-y-2">
            <h2 className="text-xl font-semibold">❌ {message}</h2>
            <div className="text-sm">Token usado: {params.token}</div>
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Voltar para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
