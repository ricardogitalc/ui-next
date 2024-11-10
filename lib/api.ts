// ui-next/lib/api.ts

import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface ApiErrorResponse {
  message?: string;
  data?: any[];
}

interface ApiError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
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

let isRefreshing = false;
let failedRequestsQueue: {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}[] = [];

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      const cookies = parseCookies();
      const refreshToken = cookies["auth.refreshToken"];
      const originalConfig = error.config!;

      // Não tenta refresh se não houver refresh token
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          setCookie(undefined, "auth.accessToken", accessToken, {
            path: "/",
            maxAge: 60 * 15, // 15 minutes
          });

          setCookie(undefined, "auth.refreshToken", newRefreshToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          api.defaults.headers.Authorization = `Bearer ${accessToken}`;

          failedRequestsQueue.forEach((request) =>
            request.onSuccess(accessToken)
          );
          failedRequestsQueue = [];

          return api(originalConfig);
        } catch (err) {
          failedRequestsQueue.forEach((request) =>
            request.onFailure(err as AxiosError)
          );
          failedRequestsQueue = [];

          // Redireciona para login apenas se o refresh falhar
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        } finally {
          isRefreshing = false;
        }
      }

      // Enfileira requisições que falharam durante o refresh
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          onFailure: (err: AxiosError) => {
            reject(err);
          },
        });
      });
    }

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
