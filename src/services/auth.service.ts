import { axiosInstance } from '@/lib/axios'
import type { LoginResponse } from '@/types/auth.types'

interface LoginCredentials {
  email: string
  password: string
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/users/login', credentials)
  return data
}

/** Login com Google (fluxo authorization code). O backend valida o código e devolve a mesma sessão do login por senha. */
export async function loginWithGoogle(code: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/users/google-auth', { code })
  return data
}
