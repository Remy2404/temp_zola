/**
 * Provider Keys Check - Polymind Backend
 * For Polymind, all providers are available via backend
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // All providers are available via Polymind backend
    // Users don't need to provide their own API keys
    return NextResponse.json({
      hasUserKey: false, // No user-provided keys needed
      provider,
    })
  } catch (error) {
    console.error("Error checking provider keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
