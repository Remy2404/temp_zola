import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  // Since Supabase has been removed and we use Telegram authentication,
  // redirect to main page with error message
  return NextResponse.redirect(
    `${origin}?error=${encodeURIComponent("Authentication is handled through Telegram Mini App")}`
  )
}
