import Axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.wepartyapp.com'

export const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('ACCESS_TOKEN')
      : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    // 401 nas rotas de login = credencial errada (o formulário mostra o erro). Só derruba a sessão
    // quando é uma chamada autenticada que expirou — senão o redirect recarrega a página e esconde o aviso.
    const url = error.config?.url ?? ''
    const isAuthAttempt = url.includes('/users/login') || url.includes('/users/google-auth')
    if (error.response?.status === 401 && !isAuthAttempt && typeof window !== 'undefined') {
      // logout() limpa store (inclui o `we-party-auth` persistido), localStorage e cookie. Sem isso o
      // AuthHydration reescrevia o cookie a partir do estado persistido e o login redirecionava de volta.
      useAuthStore.getState().logout()
      // Navegação completa de propósito: descarta todo o estado em memória da sessão expirada.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Tipo que o Orval usa para o custom mutator
export type ErrorType<E = unknown> = AxiosError<E>

export type BodyType<T> = T

export default function customAxios<T>(
  config: AxiosRequestConfig,
 ): Promise<T> {
  return axiosInstance(config).then((res) => res.data)
 }
