/**
 * User Preferences - Polymind Backend
 * For Polymind Telegram Mini App, preferences are stored client-side or in backend
 */

import { NextRequest, NextResponse } from "next/server"

// Default preferences
const DEFAULT_PREFERENCES = {
  layout: "fullscreen",
  prompt_suggestions: true,
  show_tool_invocations: true,
  show_conversation_previews: true,
  multi_model_enabled: false,
  hidden_models: [],
}

// TODO: Integrate with Polymind backend for user preferences
export async function GET() {
  try {
    // For now, return default preferences
    // Client-side will manage state using localStorage
    return NextResponse.json(DEFAULT_PREFERENCES)
  } catch (error) {
    console.error("Error in user-preferences GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const {
      layout,
      prompt_suggestions,
      show_tool_invocations,
      show_conversation_previews,
      multi_model_enabled,
      hidden_models,
    } = body

    // Validate the data types
    if (layout && typeof layout !== "string") {
      return NextResponse.json(
        { error: "layout must be a string" },
        { status: 400 }
      )
    }

    if (hidden_models && !Array.isArray(hidden_models)) {
      return NextResponse.json(
        { error: "hidden_models must be an array" },
        { status: 400 }
      )
    }

    // TODO: Store in Polymind backend
    // For now, just return success - client will manage state
    const response: any = { success: true }
    if (layout !== undefined) response.layout = layout
    if (prompt_suggestions !== undefined)
      response.prompt_suggestions = prompt_suggestions
    if (show_tool_invocations !== undefined)
      response.show_tool_invocations = show_tool_invocations
    if (show_conversation_previews !== undefined)
      response.show_conversation_previews = show_conversation_previews
    if (multi_model_enabled !== undefined)
      response.multi_model_enabled = multi_model_enabled
    if (hidden_models !== undefined) response.hidden_models = hidden_models

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in user-preferences PUT API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
