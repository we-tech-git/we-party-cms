import { useMutation } from '@tanstack/react-query'
import { updateUserProfileImage } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Uploads a new profile photo and syncs the auth store so the avatar updates
 * everywhere (topbar, dashboard greeting). Falls back to the local object URL
 * when the API response doesn't echo back a hosted URL.
 */
export function useUpdateProfileImage() {
  const setProfileImage = useAuthStore((s) => s.setProfileImage)

  return useMutation({
    mutationFn: (file: File) => updateUserProfileImage(file),
    onSuccess: (url) => {
      if (url) setProfileImage(url)
    },
  })
}
