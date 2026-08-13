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

/** An event the user interacted with (confirmed presence / liked). */
export interface UserEventRef {
  id: string
  title: string
  startDate: string | null
  /** When the interaction happened (confirmedAt / likedAt). */
  at: string | null
}

/** A comment written by the user, with the event it belongs to. */
export interface UserComment {
  id: string
  content: string
  createdAt: string | null
  isReply: boolean
  eventId: string | null
  eventTitle: string | null
}

/** Detailed shape for the profile view (normalized from GET /users/{id}). */
export interface AdminUserDetails extends AdminUser {
  lastActive: string | null
  eventsConfirmed: number | null
  eventsLiked: number | null
  eventsCommented: number | null
  /** Activity lists — empty when the payload didn't carry them. */
  confirmedEvents: UserEventRef[]
  likedEvents: UserEventRef[]
  comments: UserComment[]
}

export interface AdminUsersPage {
  users: AdminUser[]
  total: number
}
