import Axios, { AxiosError, AxiosRequestConfig } from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.dev.wepartyapp.com'

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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('LOGGED_USER')
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
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
