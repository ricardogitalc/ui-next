import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      "Ocorreu um erro. Tente novamente mais tarde.";

    return Promise.reject(error);
  }
);

export default api;

export interface AuthResponse {
  user?: any;
  message?: string;
  verificationToken?: string;
  verificationLink?: string;
  error?: string;
}

export const authApi = {
  register: async (data: {
    email: string;
    confirmEmail: string;
    firstName: string;
    lastName: string;
    whatsapp?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error: any) {
      console.error("Register Error:", error);
      return {
        error: error.response?.data?.message,
      };
    }
  },

  login: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", { email });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message,
      };
    }
  },

  googleAuth: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.get(`/auth/verify/${token}`);
      return response.data;
    } catch (error: any) {
      console.error("Verify Error:", error);
      return {
        error: error.response?.data?.message || "Erro ao verificar email",
      };
    }
  },
};
