// @todo: move in /lib/user/api.ts
import { toast } from "@/components/ui/toast"
import type { UserProfile } from "@/lib/user/types"
import { polymindFetch } from "@/lib/polymind/api"

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  try {
    const response = await polymindFetch('/webapp/user', { method: 'GET' })
    if (!response.ok) {
      console.error("Failed to fetch user:", response.statusText)
      return null
    }
    const userData = await response.json()

    // Transform backend user data to UserProfile format
    return {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      language_code: userData.language_code,
      is_premium: userData.is_premium,
      photo_url: userData.photo_url,
      profile_image: userData.photo_url || "",
      display_name: userData.first_name + (userData.last_name ? ` ${userData.last_name}` : ''),
      anonymous: false,
    }
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return null
  }
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  // Note: User profile updates are not supported in the current Telegram Mini App architecture
  // User data comes from Telegram and cannot be modified
  console.warn("User profile updates are not supported")
  toast({
    title: "Profile update not supported",
    description: "User profiles are managed by Telegram",
    status: "info",
  })
  return false
}

export async function signOutUser(): Promise<boolean> {
  // In Telegram Mini Apps, there's no sign out - users close the app
  toast({
    title: "Sign out not available",
    description: "Please close the Telegram Mini App to sign out",
    status: "info",
  })
  return false
}

export function subscribeToUserUpdates(
  userId: string,
  onUpdate: (newData: Partial<UserProfile>) => void
) {
  // No realtime subscriptions in the current architecture
  // User data is static from Telegram init data
  console.warn("User update subscriptions are not supported")
  return () => {}
}
