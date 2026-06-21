import { axiosInstance } from '@/lib/axios'

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
