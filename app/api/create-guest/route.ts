export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      })
    }

    // Since Supabase has been removed and we use Telegram authentication,
    // return a simple user object for backward compatibility
    return new Response(
      JSON.stringify({ user: { id: userId, anonymous: false } }),
      {
        status: 200,
      }
    )
  } catch (err: unknown) {
    console.error("Error in create-guest endpoint:", err)

    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal server error" }),
      { status: 500 }
    )
  }
}
