/**
 * Chat API - Polymind Backend Proxy (Optimized)
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
  attachments?: Array<{
    name: string
    content_type: string
    data: string
  }>
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequest
    const { messages, chatId, userId, model, attachments } = body

    // Quick validation (optimized)
    if (!messages?.length || !userId || !messages[messages.length - 1]?.content?.trim()) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    }

    const userMessage = messages[messages.length - 1]
    if (userMessage.role !== "user") {
      return new Response(JSON.stringify({ error: "Invalid message role" }), { status: 400 })
    }

    // Build headers
    const headers: HeadersInit = { "Content-Type": "application/json" }
    const authHeader = req.headers.get("authorization")
    if (authHeader) headers["Authorization"] = authHeader

    // Proxy request to Polymind backend (optimized payload)
    const response = await fetch(`${POLYMIND_API_URL}/webapp/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: userMessage.content,
        model,
        include_context: true,
        max_context_messages: 5, // Reduced for speed
        chat_id: chatId,
        attachments,
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Backend error: ${response.statusText}` }), 
        { status: response.status })
    }

    // Optimized stream processing
    const reader = response.body?.getReader()
    if (!reader) {
      return new Response(JSON.stringify({ error: "No response body" }), { status: 500 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ""
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue
              
              const data = line.slice(6).trim()
              if (!data) continue
              
              try {
                const parsed = JSON.parse(data)
                
                switch (parsed.type) {
                  case "content":
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(parsed.content)}\n`))
                    break
                  case "done":
                    controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
                    break
                  case "error":
                    controller.enqueue(encoder.encode(`3:${JSON.stringify(parsed.error)}\n`))
                    break
                  case "start":
                    console.log("Stream started with model:", parsed.model)
                    break
                }
              } catch (e) {
                controller.enqueue(encoder.encode(`3:${JSON.stringify("Parse error")}\n`))
              }
            }
          }
          controller.close()
        } catch (error) {
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
  } catch (err: any) {
    console.error("Error in /api/chat:", err)
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), 
      { status: err.statusCode || 500, headers: { "Content-Type": "application/json" } })
  }
}

