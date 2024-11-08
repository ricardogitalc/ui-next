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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
}

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

  const checkAuth = useCallback(async () => {
    if (isInitialized && window.location.pathname === "/verify-login") {
      return;
    }

    if (isInitialized) return;

    console.log("[AuthProvider] Iniciando verificação de autenticação");
    try {
      const response = await api.get("/auth/me");
      console.log("[AuthProvider] Resposta recebida:", response.data);

      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.log("[AuthProvider] Erro na verificação:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Verifica se está na página de verify-login
    isVerifyLoginPage.current = window.location.pathname === "/verify-login";

    // Não executa verificação inicial na página verify-login
    if (isVerifyLoginPage.current) {
      setIsInitialized(true);
      return;
    }

    checkAuth();
  }, [checkAuth]);

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
    return null; // ou um componente de loading
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