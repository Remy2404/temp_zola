import { saveFinalAssistantMessage } from "@/app/api/chat/db"
import type {
  ChatApiParams,
  LogUserMessageParams,
  StoreAssistantMessageParams,
} from "@/app/types/api.types"
import { FREE_MODELS_IDS, NON_AUTH_ALLOWED_MODELS } from "@/lib/config"
import { getModelInfo } from "@/lib/models"
import { checkUsageByModel, incrementUsage } from "@/lib/usage"
import { getUserKey, type ProviderWithoutOllama } from "@/lib/user-keys"

export async function validateAndTrackUsage({
  userId,
  model,
  isAuthenticated,
}: ChatApiParams): Promise<boolean> {
  // Since Supabase has been removed, usage validation is simplified
  await checkUsageByModel(userId, model, isAuthenticated)
  return true

  // Check if user is authenticated
  if (!isAuthenticated) {
    // For unauthenticated users, only allow specific models
    if (!NON_AUTH_ALLOWED_MODELS.includes(model)) {
      throw new Error(
        "This model requires authentication. Please sign in to access more models."
      )
    }
  } else {
    // For authenticated users, check API key requirements
    const modelInfo = getModelInfo(model)
    const provider = modelInfo?.providerId

    if (provider && provider !== "ollama") {
      const userApiKey = await getUserKey(
        userId,
        provider as ProviderWithoutOllama
      )

      // If no API key and model is not in free list, deny access
      if (!userApiKey && !FREE_MODELS_IDS.includes(model)) {
        throw new Error(
          `This model requires an API key for ${provider}. Please add your API key in settings or use a free model.`
        )
      }
    }
  }

  // Check usage limits for the model
  await checkUsageByModel(userId, model, isAuthenticated)

  return true
}

export async function incrementMessageCount({
  userId,
}: {
  userId: string
}): Promise<void> {
  try {
    await incrementUsage(userId)
  } catch (err) {
    console.error("Failed to increment message count:", err)
    // Don't throw error as this shouldn't block the chat
  }
}

export async function logUserMessage({
  userId,
  chatId,
  content,
  attachments,
  model,
  isAuthenticated,
  message_group_id,
}: Omit<LogUserMessageParams, 'supabase'>): Promise<void> {
  // Since Supabase has been removed, message logging is handled by backend API
  // This is now a no-op
}

export async function storeAssistantMessage({
  chatId,
  messages,
  message_group_id,
  model,
}: Omit<StoreAssistantMessageParams, 'supabase'>): Promise<void> {
  // Since Supabase has been removed, message storage is handled by backend API
  // This is now a no-op
}
