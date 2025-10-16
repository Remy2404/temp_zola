import type { Message as MessageAISDK } from "ai"
import { readFromIndexedDB, writeToIndexedDB } from "../persist"
import { polymindFetch } from "../../polymind/api"
import type { Chat } from "../types"

export async function getMessagesFromDb(
  chatId: string
): Promise<MessageAISDK[]> {
  // First check local cache
  const cached = await getCachedMessages(chatId)
  
  // If cache has messages, return them
  if (cached.length > 0) {
    console.log(`[MessagesAPI] Returning ${cached.length} cached messages for chatId=${chatId}`)
    return cached
  }
  
  // Cache is empty - try fetching from backend
  try {
    console.log(`[MessagesAPI] Cache empty, fetching messages from backend for chatId=${chatId}`)
    
    // For cache_key format IDs, we can fetch directly
    // For UUID format IDs, we need the model parameter
    let url = `/webapp/messages/${encodeURIComponent(chatId)}`
    
    // If chatId is not cache_key format, get the model from the chat
    if (!chatId.startsWith('user_')) {
      const chats = await readFromIndexedDB<Chat>("chats")
      const chat = (chats as Chat[]).find((c) => c.id === chatId)
      const model = chat?.model
      
      if (model) {
        url = `${url}?model=${encodeURIComponent(model)}`
        console.log(`[MessagesAPI] UUID format detected, adding model parameter: ${model}`)
      }
    } else {
      console.log(`[MessagesAPI] Cache_key format detected, fetching directly`)
    }
    
    // Wait for Telegram initialization (same pattern as chats API)
    const { telegramWebApp } = await import('@/lib/telegram/client')
    if (!telegramWebApp.isInitialized()) {
      console.log('[MessagesAPI] Waiting for Telegram initialization...')
      const initPromise = new Promise<boolean>((resolve) => {
        const checkInit = () => {
          if (telegramWebApp.isInitialized()) {
            resolve(true)
          } else {
            setTimeout(checkInit, 100)
          }
        }
        checkInit()
        setTimeout(() => resolve(false), 5000)
      })
      
      const initialized = await initPromise
      if (!initialized) {
        console.warn('[MessagesAPI] Telegram initialization timeout - returning empty messages')
        return []
      }
    }
    
    const response = await polymindFetch(url, {
      method: 'GET',
    })
    
    if (response.ok) {
      const messages = await response.json()
      console.log(`[MessagesAPI] Fetched ${messages.length} messages from backend for chatId=${chatId}`)
      
      // Cache the fetched messages
      if (messages.length > 0) {
        await cacheMessages(chatId, messages)
      }
      
      return messages
    } else if (response.status === 404) {
      // Chat was deleted or doesn't exist - return empty (no error)
      console.log(`[MessagesAPI] Chat ${chatId} not found (404) - likely deleted. Returning empty messages.`)
      await clearMessagesCache(chatId) // Clear any stale cache
      return []
    } else if (response.status === 403) {
      console.error(`[MessagesAPI] Access denied for chatId=${chatId}`)
      return []
    } else {
      const errorText = await response.text()
      console.error(`[MessagesAPI] Failed to fetch messages: ${response.status} ${response.statusText}`)
      console.error(`[MessagesAPI] Error response:`, errorText)
      return []
    }
  } catch (error) {
    console.error('[MessagesAPI] Error fetching messages from backend:', error)
    return []
  }
}

async function insertMessageToDb(chatId: string, message: MessageAISDK) {
  // No-op since Supabase has been removed
}

async function insertMessagesToDb(chatId: string, messages: MessageAISDK[]) {
  // No-op since Supabase has been removed
}

async function deleteMessagesFromDb(chatId: string) {
  // No-op since Supabase has been removed
}

type ChatMessageEntry = {
  id: string
  messages: MessageAISDK[]
}

export async function getCachedMessages(
  chatId: string
): Promise<MessageAISDK[]> {
  const entry = await readFromIndexedDB<ChatMessageEntry>("messages", chatId)

  if (!entry || Array.isArray(entry)) return []

  return (entry.messages || []).sort(
    (a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0)
  )
}

export async function cacheMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  await writeToIndexedDB("messages", { id: chatId, messages })
}

export async function addMessage(
  chatId: string,
  message: MessageAISDK
): Promise<void> {
  await insertMessageToDb(chatId, message)
  const current = await getCachedMessages(chatId)
  const updated = [...current, message]

  await writeToIndexedDB("messages", { id: chatId, messages: updated })
}

export async function setMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  await insertMessagesToDb(chatId, messages)
  await writeToIndexedDB("messages", { id: chatId, messages })
}

export async function clearMessagesCache(chatId: string): Promise<void> {
  await writeToIndexedDB("messages", { id: chatId, messages: [] })
}

export async function clearMessagesForChat(chatId: string): Promise<void> {
  await deleteMessagesFromDb(chatId)
  await clearMessagesCache(chatId)
}
