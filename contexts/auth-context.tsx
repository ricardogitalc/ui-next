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

  const checkAuth = useCallback(async () => {
    // Se já está verificando, não faz nada
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;

    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
      isCheckingAuth.current = false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    isVerifyLoginPage.current = window.location.pathname === "/verify-login";

    if (isVerifyLoginPage.current) {
      setIsInitialized(true);
      return;
    }

    checkAuth();
  }, [checkAuth]);

  // Novo useEffect para controlar redirecionamentos
  useEffect(() => {
    if (!isInitialized) return;

    if (
      isAuthenticated &&
      ["/login", "/register", "/verify-login"].includes(pathname)
    ) {
      router.replace("/");
    } else if (!isAuthenticated && ["/profile"].includes(pathname)) {
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
