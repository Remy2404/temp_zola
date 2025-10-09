import {
  AUTH_DAILY_MESSAGE_LIMIT,
  DAILY_LIMIT_PRO_MODELS,
  NON_AUTH_DAILY_MESSAGE_LIMIT,
} from "@/lib/config"
import { validateUserIdentity } from "@/lib/server/api"

export async function getMessageUsage(
  userId: string,
  isAuthenticated: boolean
) {
  // Since Supabase has been removed, usage tracking is handled by backend API
  // Return default values for compatibility
  const dailyLimit = isAuthenticated
    ? AUTH_DAILY_MESSAGE_LIMIT
    : NON_AUTH_DAILY_MESSAGE_LIMIT

  return {
    dailyCount: 0,
    dailyProCount: 0,
    dailyLimit,
    remaining: dailyLimit,
    remainingPro: DAILY_LIMIT_PRO_MODELS,
  }
}
