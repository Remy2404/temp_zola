/**
 * Proxy to Polymind backend for models
 * This route proxies requests to the Polymind backend API
 */

import { NextRequest, NextResponse } from "next/server"

const POLYMIND_API_URL = process.env.NEXT_PUBLIC_POLYMIND_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    // Get Telegram init data from request if available
    const initData = request.headers.get("X-Telegram-Init-Data")
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData
    }

    const response = await fetch(`${POLYMIND_API_URL}/webapp/models`, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch models from Polymind backend:", error)
    
    // Return error response - no fallback to avoid misleading users
    return NextResponse.json(
      { 
        error: "Backend unavailable",
        message: "Failed to fetch models from Polymind backend. Please ensure the backend is running.",
        models: []
      },
      { status: 503 }
    )
  }
}

export async function POST() {
  try {
    // Refresh models from backend
    const response = await fetch(`${POLYMIND_API_URL}/webapp/models`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      message: "Models fetched from Polymind backend",
      models: data.models,
      timestamp: new Date().toISOString(),
      count: data.models?.length || 0,
    })
  } catch (error) {
    console.error("Failed to refresh models:", error)
    return NextResponse.json(
      { error: "Failed to refresh models" },
      { status: 500 }
    )
  }
}
