/**
 * Projects API - Polymind Backend
 * For Polymind, projects are stored in backend or managed client-side
 */

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return new Response(JSON.stringify({ error: "Missing project name" }), {
        status: 400,
      })
    }

    // TODO: Store project in Polymind backend
    // For now, return success - client will manage projects
    const project = {
      id: crypto.randomUUID(),
      name,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(project)
  } catch (err: unknown) {
    console.error("Error in projects endpoint:", err)
    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // TODO: Fetch projects from Polymind backend
    // For now, return empty array - client will manage projects
    return NextResponse.json([])
  } catch (err: unknown) {
    console.error("Error fetching projects:", err)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
