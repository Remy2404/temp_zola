/**
 * Chat API - Polymind Backend Proxy
 * Proxies chat requests to Polymind backend streaming endpoint
 */

import { Message as MessageAISDK } from "ai"

export const maxDuration = 60

const POLYMIND_API_URL = process.env.NEXT_PUBLIC_POLYMIND_API_URL || "http://localhost:8000"

type ChatRequest = {
  messages: MessageAISDK[]
  chatId: string
  userId: string
  model: string
  isAuthenticated: boolean
  systemPrompt: string
  enableSearch: boolean
  message_group_id?: string
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      chatId,
      userId,
      model,
      systemPrompt,
    } = (await req.json()) as ChatRequest

    if (!messages || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        { status: 400 }
      )
    }

    const userMessage = messages[messages.length - 1]
    
    if (!userMessage || userMessage.role !== "user") {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400 }
      )
    }

    // Forward authorization header from frontend request
    const authHeader = req.headers.get("authorization")
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Proxy request to Polymind backend streaming endpoint
    const response = await fetch(`${POLYMIND_API_URL}/webapp/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: userMessage.content,
        model: model,
        include_context: true,
        max_context_messages: 10,
        chat_id: chatId || undefined,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Polymind backend error:", errorText)
      return new Response(
        JSON.stringify({ error: `Backend error: ${response.statusText}` }),
        { status: response.status }
      )
    }

    // Return the streaming response from backend
    // Transform SSE to AI SDK format
    const reader = response.body?.getReader()
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "No response body" }),
        { status: 500 }
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ""
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              controller.close()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim()
                
                // Skip empty data
                if (!data) continue
                
                try {
                  const parsed = JSON.parse(data)
                  
                  // Transform Polymind backend format to AI SDK format
                  if (parsed.type === "content") {
                    // Send text delta - properly escape the content
                    const contentStr = typeof parsed.content === 'string' 
                      ? parsed.content 
                      : String(parsed.content)
                    controller.enqueue(
                      encoder.encode(`0:${JSON.stringify(contentStr)}\n`)
                    )
                  } else if (parsed.type === "done") {
                    // Send done signal
                    controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
                  } else if (parsed.type === "error") {
                    // Send error - properly escape the error message
                    const errorMsg = typeof parsed.error === 'string' 
                      ? parsed.error 
                      : String(parsed.error || "Unknown error")
                    controller.enqueue(
                      encoder.encode(`3:${JSON.stringify(errorMsg)}\n`)
                    )
                  } else if (parsed.type === "start") {
                    // Ignore start events or log them
                    console.log("Stream started with model:", parsed.model)
                  } else {
                    console.warn("Unknown event type:", parsed.type)
                  }
                } catch (e) {
                  console.error("Failed to parse SSE data:", data, e)
                  // If we can't parse it, treat it as a raw error
                  controller.enqueue(
                    encoder.encode(`3:${JSON.stringify(`Parse error: ${data.substring(0, 100)}`)}\n`)
                  )
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    const error = err as {
      code?: string
      message?: string
      statusCode?: number
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error" 
      }),
      { 
        status: error.statusCode || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}

