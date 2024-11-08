"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = useCallback(async () => {
    if (isInitialized) {
      console.log("[AuthProvider] Estado já inicializado");
      return;
    }

    console.log("[AuthProvider] Iniciando verificação de autenticação");
    try {
      const response = await api.get("/auth/me");
      console.log("[AuthProvider] Resposta recebida:", response.data);

      // Agrupa as atualizações de estado
      const updateState = () => {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsInitialized(true);
      };

      updateState();
    } catch (error) {
      console.log("[AuthProvider] Erro na verificação:", error);

      // Agrupa as atualizações de estado
      const updateState = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsInitialized(true);
      };

      updateState();
    }
  }, [isInitialized]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!mounted || isInitialized) return;
      await checkAuth();
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuth, isInitialized]);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsInitialized(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
