import { api } from '@/lib/api'

export interface AuthUser {
  id: number
  email: string
  first_name: string
  last_name: string
}

export interface TokenResponse {
  access: string
  refresh: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  business_name: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

// El login con Google puede devolver tokens (usuario existente) o pedir registro.
export type GoogleLoginResult =
  | TokenResponse
  | { needs_registration: true; email: string; first_name: string; last_name: string }

export const authService = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    api.post('/auth/register', data).then(r => r.data),

  confirmEmail: (token: string) =>
    api.post('/auth/confirm', { token }).then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/request-reset', { email }).then(r => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset', { token, password }).then(r => r.data),

  me: () =>
    api.get<AuthUser>('/auth/me').then(r => r.data),

  // ─── Google ───────────────────────────────────────────
  googleLogin: (credential: string) =>
    api.post<GoogleLoginResult>('/auth/google', { credential }).then(r => r.data),

  googleRegister: (data: { credential: string; business_name: string; first_name?: string; last_name?: string }) =>
    api.post<TokenResponse>('/auth/google/register', data).then(r => r.data),
}
