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
