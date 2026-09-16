import { api } from '@/lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  businessName: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
    tenantId: string
  }
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    api.post('/auth/register', data).then(r => r.data),

  confirmEmail: (token: string) =>
    api.post('/auth/confirm-email', { token }).then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then(r => r.data),

  me: () =>
    api.get<AuthResponse['user']>('/auth/me').then(r => r.data),
}
