import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export interface AuthResponse {
  user?: any;
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
};
