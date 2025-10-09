import { toast } from "@/components/ui/toast"
import { useModel as useModelStore } from "@/lib/model-store/provider"
import { Chats } from "@/lib/chat-store/types"
import type { UserProfile } from "@/lib/user/types"
import { useCallback, useState } from "react"

interface UseModelProps {
  currentChat: Chats | null
  user: UserProfile | null
  updateChatModel?: (chatId: string, model: string) => Promise<void>
  chatId: string | null
}

/**
 * Hook to manage the current selected model with proper fallback logic
 * Handles both cases: with existing chat (persists to DB) and without chat (local state only)
 * @param currentChat - The current chat object
 * @param user - The current user object
 * @param updateChatModel - Function to update chat model in the database
 * @param chatId - The current chat ID
 * @returns Object containing selected model and handler function
 */
export function useModel({
  currentChat,
  user,
  updateChatModel,
  chatId,
}: UseModelProps) {
  const { models } = useModelStore()
  
  // Calculate the effective model based on priority: chat model > first available model
  const getEffectiveModel = useCallback(() => {
    const firstAvailableModel = models?.[0]?.id
    // Always return a valid model with ultimate fallback to gemini
    return currentChat?.model || firstAvailableModel || "gemini/gemini-2.0-flash-exp"
  }, [currentChat?.model, models])

  // Use local state only for temporary overrides, derive base value from props
  const [localSelectedModel, setLocalSelectedModel] = useState<string | null>(
    null
  )

  // The actual selected model: local override or computed effective model
  // Ensure we never return undefined/null - always have a valid model
  const selectedModel = localSelectedModel || getEffectiveModel() || "gemini/gemini-2.0-flash-exp"

  // Function to handle model changes with proper validation and error handling
  const handleModelChange = useCallback(
    async (newModel: string) => {
      // Always update local state first for immediate UI feedback
      setLocalSelectedModel(newModel)
      
      // For authenticated users without a chat, we can't persist yet
      // but we still allow the model selection for when they create a chat
      if (!user?.id && !chatId) {
        // For unauthenticated users without chat, just update local state
        return
      }

      // For authenticated users with a chat, persist the change
      if (chatId && updateChatModel && user?.id) {
        try {
          await updateChatModel(chatId, newModel)
          // Success - the model is now persisted in the chat
          // Keep localSelectedModel set so it doesn't revert back
        } catch (err) {
          // Revert on error - go back to the effective model
          setLocalSelectedModel(null)
          console.error("Failed to update chat model:", err)
          toast({
            title: "Failed to update chat model",
            status: "error",
          })
          throw err
        }
      }
      // For authenticated user without chat, the model will be used when creating a new chat
    },
    [chatId, updateChatModel, user?.id]
  )

  return {
    selectedModel,
    handleModelChange,
  }
}
