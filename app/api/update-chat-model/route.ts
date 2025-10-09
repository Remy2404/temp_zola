/**
 * Update Chat Model - Polymind Backend
 * For Polymind, chats are stored in backend, this will proxy to backend API
 */

export async function POST(request: Request) {
  try {
    const { chatId, model } = await request.json()

    if (!chatId || !model) {
      return new Response(
        JSON.stringify({ error: "Missing chatId or model" }),
        { status: 400 }
      )
    }

    // TODO: Proxy to Polymind backend API to update chat model
    // For now, return success - client state will manage this
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err: unknown) {
    console.error("Error in update-chat-model endpoint:", err)
    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    )
  }
}
