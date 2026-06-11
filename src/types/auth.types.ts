export interface LoggedUser {
  id: string
  username: string
  name: string
  email: string
  roles: string[]
  isEmailVerified?: boolean
  profileImage?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
  } & LoggedUser
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  LOGGED_USER: 'LOGGED_USER',
  NEW_CREATED_USER: 'NEW_CREATED_USER',
  SESSION_ID: 'SESSION_ID',
  RESET_PASSWORD_EMAIL: 'RESET_PASSWORD_EMAIL',
} as const
