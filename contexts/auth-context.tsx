"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types/user";
import { parseCookies, destroyCookie } from "nookies";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isVerifyLoginPage = useRef(false);
  const isCheckingAuth = useRef(false); // Nova ref para controlar a requisição
  const router = useRouter();
  const pathname = usePathname();

  const handleUnauthorized = () => {
    // Substituir Cookies.remove por destroyCookie
    destroyCookie(null, "access_token");
    destroyCookie(null, "refresh_token");

    // Redirecionar para login
    router.push("/login");
  };

  const checkAuth = useCallback(async () => {
    // Se já está verificando ou é a página de verify-login, não faz nada
    if (isCheckingAuth.current || isVerifyLoginPage.current) return;

    isCheckingAuth.current = true;

    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Só redireciona para login se não for erro de token expirado
      if (
        error?.response?.status === 401 &&
        !error?.response?.data?.message?.includes("expirado")
      ) {
        setUser(null);
        setIsAuthenticated(false);
        if (!isVerifyLoginPage.current && pathname !== "/login") {
          router.replace("/login");
        }
      }
    } finally {
      setIsInitialized(true);
      isCheckingAuth.current = false;
    }
  }, [router, pathname]);

  // Separa a verificação inicial da página
  useEffect(() => {
    if (typeof window === "undefined") return;
    isVerifyLoginPage.current = window.location.pathname === "/verify-login";

    // Se for página de verify-login, apenas marca como inicializado
    if (isVerifyLoginPage.current) {
      setIsInitialized(true);
      return;
    }

    // Executa verificação inicial apenas uma vez
    checkAuth();
  }, []);

  // Remove o useEffect de redirecionamento e integra a lógica no checkAuth
  useEffect(() => {
    if (!isInitialized) return;

    // Redireciona apenas se o estado de autenticação mudar
    if (
      isAuthenticated &&
      ["/login", "/register", "/verify-login"].includes(pathname)
    ) {
      router.replace("/");
    } else if (
      !isAuthenticated &&
      pathname !== "/login" &&
      pathname !== "/register" &&
      pathname !== "/verify-login"
    ) {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router, isInitialized]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsInitialized(true);
  }, []);

  const logout = async () => {
    try {
      // 1. Chama API para invalidar tokens
      await api.post("/auth/logout");

      // 2. Limpa estado local
      setUser(null);
      setIsAuthenticated(false);

      // 3. Força reload para limpar qualquer estado residual
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const refreshAuth = useCallback(async () => {
    setIsInitialized(false);
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3003/auth/me");
        if (response.status === 401) {
          handleUnauthorized();
        }
      } catch (error) {
        handleUnauthorized();
      }
    };

    // Verificar periodicamente ou após falhas de requisição
    const interval = setInterval(checkAuth, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading: !isInitialized,
        login,
        logout,
        refreshAuth, // Adiciona a nova função ao contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
