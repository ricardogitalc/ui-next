// ui-next/lib/api.ts

import axios from "axios";
import { parseCookies } from "nookies";

interface ApiError extends Error {
  response?: any;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para enviar cookies
});

api.interceptors.request.use(
  (config) => {
    const cookies = parseCookies();
    const token = cookies["auth.accessToken"];

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Formata a mensagem de erro do backend
    const errorMessage =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data) ? error.response.data[0] : null) ||
      "Ocorreu um erro. Tente novamente mais tarde.";

    // Cria um novo objeto de erro com a mensagem formatada
    const formattedError = new Error(errorMessage) as ApiError;
    formattedError.response = error.response;

    return Promise.reject(formattedError);
  }
);

export default api;
