import type { ContentPart, Message } from "@/app/types/api.types"

const DEFAULT_STEP = 0

export async function saveFinalAssistantMessage(
  supabase: any, // Removed SupabaseClient type since Supabase is removed
  chatId: string,
  messages: Message[],
  message_group_id?: string,
  model?: string
) {
  // Since Supabase has been removed, messages are saved locally only
  // This function is now a no-op
  console.log("Message saving is now handled locally - Supabase removed")
}
