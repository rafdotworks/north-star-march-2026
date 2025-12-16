import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Validate story ID to prevent path traversal attacks
function isValidStoryId(id: string): boolean {
  // Only allow alphanumeric characters and hyphens
  return /^[a-z0-9-]+$/i.test(id)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate the story ID
    if (!id || !isValidStoryId(id)) {
      return NextResponse.json(
        { error: "Invalid story ID", message: "Story ID must contain only letters, numbers, and hyphens" },
        { status: 400 }
      )
    }

    const storyPath = path.join(process.cwd(), "stories", `${id}.md`)

    // Check if file exists before attempting to read
    try {
      await fs.access(storyPath)
    } catch {
      return NextResponse.json(
        { error: "Story not found", message: `Story with ID "${id}" does not exist` },
        { status: 404 }
      )
    }

    // Read the story content
    const content = await fs.readFile(storyPath, "utf-8")

    // Ensure content is not empty
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty story", message: "Story file exists but contains no content" },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error loading story:", error)

    // Return a generic error for unexpected issues
    return NextResponse.json(
      {
        error: "Failed to load story",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}
