import { fetchClient } from "@/lib/fetch"
import {
  convertFromApiFormat,
  defaultPreferences,
} from "@/lib/user-preference-store/utils"
import type { UserProfile } from "./types"

export async function getSupabaseUser() {
  // Since Supabase has been removed, return null
  return { supabase: null, user: null }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Get user profile from backend API
    const response = await fetchClient("/webapp/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const userData = await response.json()
    if (!response.ok) {
      console.error("Failed to fetch user profile:", response.statusText)
      return null
    }

    // Format user preferences if they exist
    const formattedPreferences = userData?.user_preferences
      ? convertFromApiFormat(userData.user_preferences)
      : defaultPreferences

    return {
      ...userData,
      preferences: formattedPreferences,
    } as UserProfile
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}
