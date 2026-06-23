import { axiosInstance } from '@/lib/axios'
import type { AdminUser, AdminUserDetails, AdminUsersPage, UserStatus } from '@/types/users.types'

/* ============================================================ admin users == */

/* The API doesn't document the GET /users response shape, so everything below
 * is intentionally defensive: we read the first array we can find and pick
 * fields from a list of likely names (camelCase, snake_case, nested _count). */

type Raw = Record<string, unknown>

function asRecord(v: unknown): Raw {
  return v && typeof v === 'object' ? (v as Raw) : {}
}
function str(...vals: unknown[]): string | null {
  for (const v of vals) if (typeof v === 'string' && v.trim()) return v
  return null
}
function num(...vals: unknown[]): number | null {
  for (const v of vals) if (typeof v === 'number' && Number.isFinite(v)) return v
  return null
}

/** Find the first array buried in common envelope locations. */
function extractArray(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[]
  const p = asRecord(payload)
  for (const key of ['data', 'users', 'items', 'content', 'results']) {
    const v = p[key]
    if (Array.isArray(v)) return v as Raw[]
    // one level deeper, e.g. { data: { users: [...] } }
    const nested = asRecord(v)
    for (const k2 of ['users', 'items', 'content', 'data']) {
      if (Array.isArray(nested[k2])) return nested[k2] as Raw[]
    }
  }
  return []
}
function extractTotal(payload: unknown, fallback: number): number {
  const p = asRecord(payload)
  return num(p.total, p.count, asRecord(p.data).total, asRecord(p.meta).total) ?? fallback
}

function deriveStatus(u: Raw): UserStatus {
  const raw = str(u.status, u.accountStatus, u.state)?.toUpperCase() ?? ''
  if (raw.includes('BLOCK') || raw.includes('BAN') || raw.includes('SUSPEND')) return 'blocked'
  if (u.isBlocked === true || u.blocked === true || u.banned === true || u.isActive === false) return 'blocked'
  return 'active'
}

function normalizeUser(u: Raw): AdminUser {
  return {
    id: str(u.id, u._id, u.uuid) ?? '',
    name: str(u.name, u.fullName, u.displayName, u.username) ?? 'Sem nome',
    username: str(u.username, u.handle),
    email: str(u.email) ?? '—',
    profileImage: str(u.profileImage, u.avatar, u.profilePicture, u.photo),
    role: str(u.role, u.type, asRecord(u.role).name),
    status: deriveStatus(u),
    createdAt: str(u.createdAt, u.created_at, u.registeredAt, u.registered_at),
  }
}

function normalizeDetails(u: Raw): AdminUserDetails {
  const count = asRecord(u._count)
  return {
    ...normalizeUser(u),
    lastActive: str(u.lastActive, u.lastLoginAt, u.lastSeenAt, u.last_login_at, u.updatedAt, u.updated_at),
    eventsConfirmed: num(u.eventsConfirmed, u.confirmedEvents, u.attendancesCount, count.attendances, count.confirmedEvents),
    eventsLiked: num(u.eventsLiked, u.likedEvents, u.likesCount, count.likes, count.likedEvents),
    eventsCommented: num(u.eventsCommented, u.commentedEvents, u.commentsCount, count.comments, count.commentedEvents),
  }
}

/** GET /users — paginated list (server params sent best-effort; the result is
 * also sorted by createdAt desc client-side as the contract isn't documented). */
export async function getAdminUsers(page = 1, limit = 100): Promise<AdminUsersPage> {
  const { data } = await axiosInstance.get('/users', { params: { page, limit } })
  const rows = extractArray(data).map(normalizeUser)
  rows.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return { users: rows, total: extractTotal(data, rows.length) }
}

/** GET /users/{id} — detailed profile for the view modal. */
export async function getAdminUserDetails(id: string): Promise<AdminUserDetails> {
  const { data } = await axiosInstance.get(`/users/${id}`)
  const obj = Array.isArray(data) ? data[0] : (asRecord(data).data ?? data)
  return normalizeDetails(asRecord(obj))
}

/** POST /users/{id}/block — blocks the user (prevents login; keeps data). */
export async function blockUser(id: string): Promise<void> {
  await axiosInstance.post(`/users/${id}/block`)
}

/** POST /users/{id}/unblock — restores access. */
export async function unblockUser(id: string): Promise<void> {
  await axiosInstance.post(`/users/${id}/unblock`)
}

/** DELETE /users — removes a user permanently (id sent in the request body,
 * since the route takes no path param). */
export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete('/users', { data: { id } })
}

/* ===================================================== profile image (self) */

/** Possible shapes the API may return for the profile-image update. */
interface ProfileImageResponse {
  data?: { profileImage?: string; avatar?: string; profilePicture?: string }
  profileImage?: string
  avatar?: string
  profilePicture?: string
}

function extractImageUrl(payload: ProfileImageResponse): string | undefined {
  const flat = payload.profileImage ?? payload.avatar ?? payload.profilePicture
  const nested = payload.data?.profileImage ?? payload.data?.avatar ?? payload.data?.profilePicture
  return flat ?? nested
}

/**
 * Updates the logged user's profile photo — PATCH /users/profile-image
 * (multipart field name `profileImage`, mirroring the web-OPS flow).
 * Override the instance's default `application/json` so the browser sets
 * `multipart/form-data` with the correct boundary.
 */
export async function updateUserProfileImage(file: File): Promise<string | undefined> {
  const form = new FormData()
  form.append('profileImage', file)
  const { data } = await axiosInstance.patch<ProfileImageResponse>('/users/profile-image', form, {
    headers: { 'Content-Type': undefined },
  })
  return extractImageUrl(data)
}
