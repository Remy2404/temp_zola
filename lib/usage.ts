import { UsageLimitError } from "@/lib/api"
import {
  AUTH_DAILY_MESSAGE_LIMIT,
  DAILY_LIMIT_PRO_MODELS,
  FREE_MODELS_IDS,
  NON_AUTH_DAILY_MESSAGE_LIMIT,
} from "@/lib/config"

const isFreeModel = (modelId: string) => FREE_MODELS_IDS.includes(modelId)
const isProModel = (modelId: string) => !isFreeModel(modelId)

/**
 * Checks the user's daily usage to see if they've reached their limit.
 * Since Supabase has been removed, this now returns default values.
 */
export async function checkUsage(userId: string) {
  // Since Supabase has been removed, usage checking is handled by backend API
  // Return default values that won't block usage
  return {
    userData: { message_count: 0, daily_message_count: 0, anonymous: false, premium: false },
    dailyCount: 0,
    dailyLimit: AUTH_DAILY_MESSAGE_LIMIT,
  }
}

/**
 * Increments usage counters.
 * Since Supabase has been removed, this is now a no-op.
 */
export async function incrementUsage(userId: string): Promise<void> {
  // Usage increment is handled by backend API
}

/**
 * Checks pro model usage.
 * Since Supabase has been removed, this returns default values.
 */
export async function checkProUsage(userId: string) {
  // Pro usage checking is handled by backend API
  return {
    dailyProCount: 0,
    limit: DAILY_LIMIT_PRO_MODELS,
  }
}

/**
 * Increments pro usage.
 * Since Supabase has been removed, this is now a no-op.
 */
export async function incrementProUsage(userId: string) {
  // Pro usage increment is handled by backend API
}

/**
 * Checks usage by model.
 * Since Supabase has been removed, this uses simplified logic.
 */
export async function checkUsageByModel(
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  if (isProModel(modelId)) {
    if (!isAuthenticated) {
      throw new UsageLimitError("You must log in to use this model.")
    }
    return await checkProUsage(userId)
  }

  return await checkUsage(userId)
}

/**
 * Increments usage by model.
 * Since Supabase has been removed, this is now a no-op.
 */
export async function incrementUsageByModel(
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  if (isProModel(modelId)) {
    if (!isAuthenticated) return
    return await incrementProUsage(userId)
  }

  return await incrementUsage(userId)
}
