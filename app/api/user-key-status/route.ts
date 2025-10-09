/**
 * User Key Status - Polymind Backend
 * For Polymind, all providers are available via backend
 */

import { NextResponse } from "next/server"

export async function GET() {
  // All providers are available via Polymind backend
  // User doesn't need to provide API keys
  return NextResponse.json({
    openrouter: true,
    openai: true,
    mistral: true,
    google: true,
    perplexity: true,
    xai: true,
    anthropic: true,
    deepseek: true,
  })
}
