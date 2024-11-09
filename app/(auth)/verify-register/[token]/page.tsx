"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

export default function VerifyRegisterPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!params.token || verificationAttempted.current) {
      !params.token && router.replace("/register");
      return;
    }

    const verifyRegistration = async () => {
      try {
        const response = await api.get(`/auth/verify/${params.token}`);

        if (response.data?.user) {
          setStatus("success");
          setMessage("Email verificado com sucesso!");

          // Fazer login automaticamente após verificação
          login(response.data.user);

          // Redirecionar após um breve delay
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Erro na verificação:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Erro ao verificar email"
        );

        // Redirecionar de volta para registro em caso de erro
        setTimeout(() => {
          router.replace("/register");
        }, 3000);
      }
    };

    verificationAttempted.current = true;
    verifyRegistration();
  }, [params.token, router, login]);

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
            ? "Verificando seu email..."
            : status === "success"
            ? "✅ Email verificado!"
            : "❌ Erro na verificação"}
        </h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
