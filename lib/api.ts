// ui-next/lib/api.ts

import axios from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para enviar cookies
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] Fazendo requisição para: ${config.url}`);
    const cookies = parseCookies();
    const token = cookies["auth.accessToken"];

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log("[API] Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Aqui você pode adicionar lógica para refresh token se necessário
    }
    return Promise.reject(error);
  }
);

export default api;
