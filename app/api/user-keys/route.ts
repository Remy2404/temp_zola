/**
 * User API Keys - Polymind Backend
 * For Polymind, all API keys are managed by the backend
 * Users don't need to provide their own API keys
 */

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    // TODO: In the future, users may be able to add custom API keys via Polymind backend
    // For now, all API keys are managed server-side
    return NextResponse.json({
      success: false,
      message:
        "API keys are managed by Polymind. You don't need to provide your own keys.",
    })
  } catch (error) {
    console.error("Error in POST /api/user-keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      )
    }

    // API keys are managed by Polymind backend, users can't delete them
    return NextResponse.json({
      success: false,
      message: "API keys are managed by Polymind backend.",
    })
  } catch (error) {
    console.error("Error in DELETE /api/user-keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
