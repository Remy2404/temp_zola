import { validateUserIdentity } from "@/lib/server/api"
import { checkUsageByModel } from "@/lib/usage"

type CreateChatInput = {
  userId: string
  title?: string
  model: string
  isAuthenticated: boolean
  projectId?: string
}

export async function createChatInDb({
  userId,
  title,
  model,
  isAuthenticated,
  projectId,
}: CreateChatInput) {
  // Since Supabase has been removed, chat creation is handled by backend API
  // For now, return a mock chat object for frontend compatibility
  await checkUsageByModel(userId, model, isAuthenticated)

  return {
    id: crypto.randomUUID(),
    user_id: userId,
    title: title || "New Chat",
    model,
    project_id: projectId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
