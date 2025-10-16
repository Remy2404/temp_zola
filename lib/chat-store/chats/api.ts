import { readFromIndexedDB, writeToIndexedDB } from "@/lib/chat-store/persist"
import type { Chat, Chats } from "@/lib/chat-store/types"
import { fetchClient } from "../../fetch"
import { polymindFetch } from "../../polymind/api"
import {
  API_ROUTE_TOGGLE_CHAT_PIN,
  API_ROUTE_UPDATE_CHAT_MODEL,
} from "../../routes"

/**
 * Fetch chat sessions from MongoDB backend and cache them in IndexedDB
 */
export async function fetchAndCacheChats(): Promise<Chats[]> {
  try {
    console.log('[ChatsAPI] Fetching sessions from MongoDB backend...')
    
    // CRITICAL FIX: Wait for Telegram to initialize before making authenticated requests
    const { telegramWebApp } = await import('@/lib/telegram/client')
    if (!telegramWebApp.isInitialized()) {
      console.log('[ChatsAPI] Waiting for Telegram initialization...')
      const initPromise = new Promise<boolean>((resolve) => {
        const checkInit = () => {
          if (telegramWebApp.isInitialized()) {
            resolve(true)
          } else {
            setTimeout(checkInit, 100)
          }
        }
        checkInit()
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000)
      })
      
      const initialized = await initPromise
      if (!initialized) {
        console.warn('[ChatsAPI] Telegram initialization timeout - cannot fetch sessions without auth')
        // Return cached data if available
        return await getCachedChats()
      }
    }
    
    const response = await polymindFetch('/webapp/sessions', {
      method: 'GET',
    })
    
    console.log(`[ChatsAPI] Response status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const sessions = await response.json()
      console.log(`[ChatsAPI] Received ${sessions.length} sessions from backend`)
      console.log(`[ChatsAPI] First session sample:`, sessions[0])

      // Convert backend ChatSession format to frontend Chats format
      const backendChats: Chats[] = sessions.map((session: unknown) => {
        const s = session as Record<string, unknown>
        console.log(`[ChatsAPI] Mapping session:`, s)
        return {
          id: s.id as string,
          title: s.title as string,
          created_at: s.created_at as string,
          updated_at: s.updated_at as string,
          model: s.model as string,
          user_id: s.user_id as string,
          public: true,
          pinned: (s.pinned as boolean) || false,
          pinned_at: (s.pinned_at as string) || null,
          project_id: null,
        }
      })

      console.log(`[ChatsAPI] Converted to ${backendChats.length} backend chats`)
      console.log(`[ChatsAPI] First converted chat:`, backendChats[0])

      // Merge backend results with local cache so optimistic/local-only chats are preserved
      try {
        const cached = await getCachedChats()

        // Build map of chats; backend is source of truth
        const mergedMap = new Map<string, Chats>()
        
        // First add cached chats
        cached.forEach((c) => mergedMap.set(c.id, c))
        
        // Then add/override with backend chats (backend wins)
        backendChats.forEach((c) => mergedMap.set(c.id, c))
        
        // CLEANUP: Remove chats that exist in cache but not in backend
        // This handles the case where a chat was deleted but cache wasn't updated
        const backendIds = new Set(backendChats.map(c => c.id))
        const staleChats = cached.filter(c => !backendIds.has(c.id))
        
        if (staleChats.length > 0) {
          console.log(`[ChatsAPI] Removing ${staleChats.length} stale chats from cache:`, staleChats.map(c => c.id))
          staleChats.forEach(c => mergedMap.delete(c.id))
        }

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => +new Date(b.created_at || "") - +new Date(a.created_at || "")
        )

        await writeToIndexedDB("chats", merged)
        console.log(`[ChatsAPI] Merged and updated IndexedDB cache with ${merged.length} sessions (backend: ${backendChats.length}, cached: ${cached.length})`)

        return merged
      } catch (err) {
        // If merging fails for any reason, fall back to writing backend-only data
        await writeToIndexedDB("chats", backendChats)
        console.log(`[ChatsAPI] Updated IndexedDB cache with ${backendChats.length} backend sessions (merge fallback)`)
        return backendChats
      }
    } else if (response.status === 401) {
      // Authentication failed. Do NOT clear local cache here because that can
      // erase optimistic or recently-created chats that exist locally but
      // aren't yet visible to the backend (transient auth timing issues).
      console.error(`[ChatsAPI] Authentication failed - returning cached chats`)
      return await getCachedChats()
    } else {
      const errorText = await response.text()
      console.error(`[ChatsAPI] Failed to fetch sessions: ${response.status} ${response.statusText}`)
      console.error(`[ChatsAPI] Error response:`, errorText)
    }
  } catch (error) {
    console.error('[ChatsAPI] Error fetching chats from MongoDB backend:', error)
  }
  
  // Fallback to cached chats if backend fails
  console.log('[ChatsAPI] Falling back to cached chats')
  return await getCachedChats()
}

export async function getCachedChats(): Promise<Chats[]> {
  const all = await readFromIndexedDB<Chats>("chats")
  return (all as Chats[]).sort(
    (a, b) => +new Date(b.created_at || "") - +new Date(a.created_at || "")
  )
}

export async function updateChatTitle(
  id: string,
  title: string
): Promise<void> {
  // Update only in cache - backend updates happen through /webapp/chat endpoint
  const all = await getCachedChats()
  const updated = (all as Chats[]).map((c) =>
    c.id === id ? { ...c, title } : c
  )
  await writeToIndexedDB("chats", updated)
}

export async function deleteChat(id: string): Promise<void> {
  try {
    console.log(`[ChatsAPI] Deleting chat ${id} from backend...`)
    
    // Delete from backend first using polymindFetch
    const response = await polymindFetch(`/webapp/chats/${id}`, {
      method: 'DELETE',
    })
    
    // Handle success (200) or already deleted (404) - both mean the chat doesn't exist on backend
    if (response.ok) {
      const result = await response.json()
      console.log(`[ChatsAPI] Successfully deleted chat from backend:`, result)
    } else if (response.status === 404) {
      console.log(`[ChatsAPI] Chat ${id} already deleted or not found on backend (404) - removing from local cache`)
    } else {
      const errorText = await response.text()
      console.error(`[ChatsAPI] Failed to delete chat from backend: ${response.status} ${response.statusText}`)
      console.error(`[ChatsAPI] Error response:`, errorText)
      throw new Error(`Failed to delete chat: ${response.statusText}`)
    }
  } catch (error) {
    console.error('[ChatsAPI] Error deleting chat from backend:', error)
    throw error
  }
  
  // Delete from local cache (even if 404 - chat is gone from backend either way)
  const all = await getCachedChats()
  await writeToIndexedDB(
    "chats",
    (all as Chats[]).filter((c) => c.id !== id)
  )
  console.log(`[ChatsAPI] Deleted chat ${id} from local cache`)
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const all = await readFromIndexedDB<Chat>("chats")
  return (all as Chat[]).find((c) => c.id === chatId) || null
}

export async function getUserChats(): Promise<Chat[]> {
  // Return cached chats - use fetchAndCacheChats to refresh from backend
  return await getCachedChats()
}

export async function createChat(
  userId: string,
  title: string,
  model: string,
  systemPrompt: string
): Promise<string> {
  // Generate new chat ID and save to cache
  // Backend will create conversation on first message
  const finalId = crypto.randomUUID()

  await writeToIndexedDB("chats", {
    id: finalId,
    title,
    model,
    user_id: userId,
    system_prompt: systemPrompt,
    created_at: new Date().toISOString(),
  })

  return finalId
}

export async function updateChatModel(chatId: string, model: string) {
  try {
    const res = await fetchClient(API_ROUTE_UPDATE_CHAT_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, model }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update chat model: ${res.status} ${res.statusText}`
      )
    }

    const all = await getCachedChats()
    const updated = (all as Chats[]).map((c) =>
      c.id === chatId ? { ...c, model } : c
    )
    await writeToIndexedDB("chats", updated)

    return responseData
  } catch (error) {
    console.error("Error updating chat model:", error)
    throw error
  }
}

export async function toggleChatPin(chatId: string, pinned: boolean) {
  try {
    const res = await fetchClient(API_ROUTE_TOGGLE_CHAT_PIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, pinned }),
    })
    const responseData = await res.json()
    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update pinned: ${res.status} ${res.statusText}`
      )
    }
    const all = await getCachedChats()
    const now = new Date().toISOString()
    const updated = (all as Chats[]).map((c) =>
      c.id === chatId ? { ...c, pinned, pinned_at: pinned ? now : null } : c
    )
    await writeToIndexedDB("chats", updated)
    return responseData
  } catch (error) {
    console.error("Error updating chat pinned:", error)
    throw error
  }
}

export async function createNewChat(
  userId: string,
  title?: string,
  model?: string,
  isAuthenticated?: boolean,
  projectId?: string
): Promise<Chats> {
  try {
    // For Telegram webapp users, use cache_key format to match backend
    // This eliminates UUID mismatch and enables direct message fetching
    const isTelegramUser = isAuthenticated === true
    const chatId = isTelegramUser && model
      ? `user_${userId}_model_${model}`
      : crypto.randomUUID()

    console.log(`[ChatsAPI] Creating new chat with ID: ${chatId} (Telegram: ${isTelegramUser}, model: ${model})`)

    const payload: {
      userId: string
      title: string
      model?: string
      isAuthenticated?: boolean
      projectId?: string
    } = {
      userId,
      title: title || "New Chat",
      model: model,
      isAuthenticated,
    }

    if (projectId) {
      payload.projectId = projectId
    }

    const res = await fetchClient("/api/create-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseData = await res.json()

    if (!res.ok || !responseData.chat) {
      throw new Error(responseData.error || "Failed to create chat")
    }

    // Override the backend-generated ID with our cache_key format for Telegram users
    const chat: Chats = {
      id: isTelegramUser && model ? chatId : responseData.chat.id,
      title: responseData.chat.title,
      created_at: responseData.chat.created_at,
      model: responseData.chat.model,
      user_id: responseData.chat.user_id,
      public: responseData.chat.public,
      updated_at: responseData.chat.updated_at,
      project_id: responseData.chat.project_id || null,
      pinned: responseData.chat.pinned ?? false,
      pinned_at: responseData.chat.pinned_at ?? null,
    }

    // Merge the new backend chat with any cached chats. Remove any
    // optimistic entries that match the same title+user (best effort)
    try {
      const cached = await getCachedChats()

      // Remove optimistic entries by heuristic: ids starting with 'optimistic-'
      // or entries that have same title and user_id but different id.
      const filtered = cached.filter((c) => {
        if (c.id && String(c.id).startsWith("optimistic-")) return false
        if (c.title === chat.title && c.user_id === chat.user_id && c.id !== chat.id) return false
        return true
      })

      const mergedMap = new Map<string, Chats>()
      filtered.forEach((c) => mergedMap.set(c.id, c))
      mergedMap.set(chat.id, chat)

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => +new Date(b.created_at || "") - +new Date(a.created_at || "")
      )

      await writeToIndexedDB("chats", merged)

      // Ensure there's an initialized messages entry for this chat so the
      // MessagesProvider can read an empty array (avoids transient empty state)
      try {
        await writeToIndexedDB("messages", { id: chat.id, messages: [] })
      } catch (err) {
        console.warn('[ChatsAPI] Failed to initialize messages entry for chat', chat.id, err)
      }

      return chat
    } catch (err) {
      // On failure, fall back to writing single chat
      await writeToIndexedDB("chats", chat)
      return chat
    }
  } catch (error) {
    console.error("Error creating new chat:", error)
    throw error
  }
}
