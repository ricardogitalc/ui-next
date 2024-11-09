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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  profilePicture: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
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
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      // A resposta já contém os dados do usuário diretamente
      setUser(response.data);
      setIsAuthenticated(true);
      console.log("Dados do usuário:", response.data); // Debug

      // Redireciona usuário logado tentando acessar páginas de auth
      if (["/login", "/register", "/verify-login"].includes(pathname)) {
        router.replace("/");
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      // Redireciona usuário não logado tentando acessar rotas protegidas
      if (["/profile"].includes(pathname)) {
        // Removido "/" da lista
        router.replace("/login");
      }
    } finally {
      setIsInitialized(true);
    }
  }, [pathname, router]);

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

  // Adicione este console.log para debug
  console.log("Auth Context State:", {
    isAuthenticated,
    user,
  });

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
