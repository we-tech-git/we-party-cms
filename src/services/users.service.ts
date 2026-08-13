import { axiosInstance } from '@/lib/axios'
import type {
  AdminUser,
  AdminUserDetails,
  AdminUsersPage,
  UserComment,
  UserEventRef,
  UserStatus,
} from '@/types/users.types'

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
    role: str(asRecord(u.role).name, u.role, u.type),
    status: deriveStatus(u),
    createdAt: str(u.createdAt, u.created_at, u.registeredAt, u.registered_at),
  }
}

/** Pull the array under the first key that actually holds one. */
function pickArray(u: Raw, ...keys: string[]): Raw[] {
  for (const k of keys) {
    const v = u[k]
    if (Array.isArray(v)) return v as Raw[]
  }
  return []
}

/** Map an event-interaction entry (attendance / like) to a flat reference. */
function toEventRef(raw: Raw, ...atKeys: string[]): UserEventRef {
  // The API may nest the event ({ event: {...} }) or spread it at the top level.
  const nested = asRecord(raw.event)
  const ev = Object.keys(nested).length > 0 ? nested : raw
  return {
    id: str(ev.id) ?? '',
    title: str(ev.title, ev.name) ?? 'Evento sem título',
    startDate: str(ev.startDate, ev.start_date),
    at: str(...atKeys.map((k) => raw[k]), raw.createdAt),
  }
}

function toComment(raw: Raw): UserComment {
  const ev = asRecord(raw.event)
  return {
    id: str(raw.id) ?? '',
    content: str(raw.content, raw.text, raw.body) ?? '',
    createdAt: str(raw.createdAt, raw.created_at),
    isReply: raw.isReply === true || str(raw.parentId) != null,
    eventId: str(ev.id, raw.eventId),
    eventTitle: str(ev.title, ev.name),
  }
}

function normalizeDetails(u: Raw): AdminUserDetails {
  const count = asRecord(u._count)

  const confirmedEvents = pickArray(u, 'eventAttendances', 'attendances', 'confirmedEvents').map((r) =>
    toEventRef(r, 'confirmedAt'),
  )
  const likedEvents = pickArray(u, 'likedEvents', 'eventLikes', 'likes').map((r) => toEventRef(r, 'likedAt'))
  const comments = pickArray(u, 'comments', 'eventComments').map(toComment)

  const getEventCount = (
    countKey: string,
    userFields: string[],
    arrayFields: string[]
  ): number | null => {
    const numVal = num(count[countKey], ...userFields.map((f) => u[f]))
    if (numVal != null) return numVal

    for (const arrayKey of arrayFields) {
      const arr = u[arrayKey]
      if (Array.isArray(arr)) return arr.length
    }
    return null
  }

  return {
    ...normalizeUser(u),
    lastActive: str(u.lastActive, u.lastLoginAt, u.lastSeenAt, u.last_login_at, u.updatedAt, u.updated_at),
    eventsConfirmed: getEventCount('attendances', ['eventsConfirmed', 'attendancesCount'], ['eventAttendances', 'attendances']),
    eventsLiked: getEventCount('likes', ['eventsLiked', 'likesCount'], ['eventLikes', 'likedEvents']),
    eventsCommented: getEventCount('comments', ['eventsCommented', 'commentsCount'], ['eventComments', 'comments']),
    confirmedEvents,
    likedEvents,
    comments,
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

/** PATCH /users/{id}/block — blocks the user (prevents login; keeps data). */
export async function blockUser(id: string): Promise<void> {
  await axiosInstance.patch(`/users/${id}/block`)
}

/** PATCH /users/{id}/unblock — restores access. */
export async function unblockUser(id: string): Promise<void> {
  await axiosInstance.patch(`/users/${id}/unblock`)
}

/** DELETE /users — removes a user permanently (id sent in the request body,
 * since the route takes no path param). */
export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete('/users', { data: { id } })
}

/** POST /users/{id}/assign-role — grants a role (e.g. "admin") to the user. */
export async function assignUserRole(id: string, roleName: string): Promise<void> {
  await axiosInstance.post(`/users/${id}/assign-role`, { roleName })
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
