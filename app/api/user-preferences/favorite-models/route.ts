/**
 * Favorite Models - Polymind Backend
 * For Polymind Telegram Mini App, favorites are stored in Polymind backend
 */

import { NextRequest, NextResponse } from "next/server"

// TODO: Integrate with Polymind backend API for user preferences
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { favorite_models } = body

    // Validate the favorite_models array
    if (!Array.isArray(favorite_models)) {
      return NextResponse.json(
        { error: "favorite_models must be an array" },
        { status: 400 }
      )
    }

    // Validate that all items in the array are strings
    if (!favorite_models.every((model) => typeof model === "string")) {
      return NextResponse.json(
        { error: "All favorite_models must be strings" },
        { status: 400 }
      )
    }

    // TODO: Store in Polymind backend via API
    // For now, return success (client-side state will manage favorites)
    return NextResponse.json({
      success: true,
      favorite_models,
    })
  } catch (error) {
    console.error("Error in favorite-models API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // TODO: Fetch from Polymind backend API
    // For now, return empty array (client-side state will manage favorites)
    return NextResponse.json({
      favorite_models: [],
    })
  } catch (error) {
    console.error("Error in favorite-models GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
