export interface AuthResponse {
  message?: string;
  error?: string;
  success?: boolean; // opcional, caso você use
  data?: any; // opcional, caso você use
}

// Se você tiver uma interface específica para o registro, pode criar assim:
export interface RegisterResponse extends AuthResponse {
  // campos específicos do registro, se houver
}
