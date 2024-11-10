export interface AuthResponse {
  message?: string;
  error?: string;
  success?: boolean;
  user?: any;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
