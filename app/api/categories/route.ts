import { NextResponse } from "next/server"
import { getCategories, redis, type Category } from "@/lib/db"
import { generateId } from "ai"

// Get all categories
export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// Add a new category
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const categories = await getCategories()

    const newCategory: Category = {
      id: generateId(),
      name: body.name,
      icon: body.icon || "Grid",
    }

    categories.push(newCategory)
    await redis.set("menu:categories", categories)

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

