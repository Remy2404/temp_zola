import type { UserPreferences } from "../user-preference-store/utils"

export type UserProfile = {
  id: number
  first_name: string
  last_name?: string | null
  username?: string | null
  language_code?: string | null
  is_premium: boolean
  photo_url?: string | null
  profile_image: string
  display_name: string
  preferences?: UserPreferences
  anonymous?: boolean
}
