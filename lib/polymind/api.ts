/**
 * Polymind Backend API Client
 * Connects to FastAPI backend for AI chat functionality
 */

import { telegramWebApp } from '../telegram/client'

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_POLYMIND_API_URL || 'http://localhost:8000'

/**
 * Wait for Telegram WebApp to initialize (max 5 seconds)
 */
async function waitForTelegramInit(maxWaitMs = 5000): Promise<boolean> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitMs) {
    if (telegramWebApp.isAvailable()) {
      // Give it a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 100))
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return false
}

/**
 * Fetch with Telegram authentication
 * Exported for use in other modules that need authenticated requests
 * 
 * Supports two authentication methods:
 * 1. Primary: Telegram initData (from mini app)
 * 2. Fallback: user_id URL parameter (when opened outside Telegram, e.g., "Open" button)
 */
export async function polymindFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Wait for Telegram initialization before getting auth data
  if (!telegramWebApp.isInitialized()) {
    const initialized = await waitForTelegramInit()
    if (!initialized) {
      console.warn('[Polymind API] Telegram initialization timeout - proceeding with fallback auth')
    }
  }
  
  const initData = telegramWebApp.getInitData()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Add Telegram authentication if available
  // Backend expects: Authorization: tma {initData}
  if (initData) {
    (headers as Record<string, string>)['Authorization'] = `tma ${initData}`
    console.log('[Polymind API] Request authenticated with Telegram init data')
  } else {
    console.warn('[Polymind API] No Telegram init data available - attempting fallback authentication')
  }

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  
  // Fallback: if no initData, try to add user_id from URL parameters
  // This supports opening the app via "Open" button outside Telegram context
  if (!initData) {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const userIdParam = urlParams.get('user_id')
      
      if (userIdParam) {
        // Add user_id as query parameter for fallback authentication
        const separator = url.includes('?') ? '&' : '?'
        url += `${separator}user_id=${encodeURIComponent(userIdParam)}`
        console.log('[Polymind API] Using fallback authentication with user_id from URL')
      }
    } catch (error) {
      console.warn('[Polymind API] Error processing URL parameters:', error)
    }
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Get available AI models
 */
export async function getModels() {
  try {
    const response = await polymindFetch('/webapp/models')
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching models:', error)
    throw error
  }
}

/**
 * Stream chat response using Server-Sent Events
 */
export async function* streamChatResponse(params: {
  message: string
  model?: string
  include_context?: boolean
  max_context_messages?: number
  chat_id?: string
  attachments?: Array<{
    name: string
    contentType: string
    data: string // base64 encoded
  }>
}): AsyncGenerator<{
  type: 'start' | 'content' | 'done' | 'error'
  content?: string
  model?: string
  timestamp?: number
  error?: string
}> {
  const response = await polymindFetch('/webapp/chat/stream', {
    method: 'POST',
    body: JSON.stringify({
      message: params.message,
      model: params.model,
      include_context: params.include_context ?? true,
      max_context_messages: params.max_context_messages ?? 10,
      chat_id: params.chat_id,
      attachments: params.attachments,
    }),
  })

  if (!response.ok) {
    throw new Error(`Stream failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('Response body is null')
  }

  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          try {
            const parsed = JSON.parse(data)
            yield parsed
          } catch {
            console.error('Failed to parse SSE data:', data)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Create a new chat session
 */
export async function createChat(params: {
  title?: string
  model?: string
}) {
  try {
    const response = await polymindFetch('/webapp/chats', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating chat:', error)
    throw error
  }
}

/**
 * Get chat sessions
 */
export async function getChats(params: {
  limit?: number
  offset?: number
} = {}) {
  try {
    const query = new URLSearchParams({
      limit: String(params.limit || 50),
      offset: String(params.offset || 0),
    })
    
    const response = await polymindFetch(`/webapp/chats?${query}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching chats:', error)
    throw error
  }
}

/**
 * Delete a chat session
 */
export async function deleteChat(chatId: string) {
  try {
    const response = await polymindFetch(`/webapp/chats/${chatId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete chat: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting chat:', error)
    throw error
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences() {
  try {
    const response = await polymindFetch('/webapp/user/preferences')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching preferences:', error)
    throw error
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(preferences: Record<string, unknown>) {
  try {
    const response = await polymindFetch('/webapp/user/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating preferences:', error)
    throw error
  }
}

const polymindApi = {
  getModels,
  streamChatResponse,
  createChat,
  getChats,
  deleteChat,
  getUserPreferences,
  updateUserPreferences,
}

export default polymindApi
