export type UserStatus = 'active' | 'blocked'

/** Row shape for the admin users list (normalized from GET /users). */
export interface AdminUser {
  id: string
  name: string
  username: string | null
  email: string
  profileImage: string | null
  role: string | null
  status: UserStatus
  createdAt: string | null
}

/** Detailed shape for the profile view (normalized from GET /users/{id}). */
export interface AdminUserDetails extends AdminUser {
  lastActive: string | null
  eventsConfirmed: number | null
  eventsLiked: number | null
  eventsCommented: number | null
}

export interface AdminUsersPage {
  users: AdminUser[]
  total: number
}
