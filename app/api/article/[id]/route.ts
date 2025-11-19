import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Validate article ID to prevent path traversal attacks
function isValidArticleId(id: string): boolean {
  // Only allow alphanumeric characters and hyphens
  return /^[a-z0-9-]+$/i.test(id)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate the article ID
    if (!id || !isValidArticleId(id)) {
      return NextResponse.json(
        { error: "Invalid article ID", message: "Article ID must contain only letters, numbers, and hyphens" },
        { status: 400 }
      )
    }

    const articlePath = path.join(process.cwd(), "writings", `${id}.md`)

    // Check if file exists before attempting to read
    try {
      await fs.access(articlePath)
    } catch {
      return NextResponse.json(
        { error: "Article not found", message: `Article with ID "${id}" does not exist` },
        { status: 404 }
      )
    }

    // Read the article content
    const content = await fs.readFile(articlePath, "utf-8")

    // Ensure content is not empty
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty article", message: "Article file exists but contains no content" },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error loading article:", error)

    // Return a generic error for unexpected issues
    return NextResponse.json(
      {
        error: "Failed to load article",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}