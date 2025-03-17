import { NextResponse } from "next/server"
import { getMenuItems, redis } from "@/lib/db-local"
import { generateId } from "ai"

// Get all menu items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const items = await getMenuItems()

    // Filter by category if provided
    const filteredItems = category && category !== "cat1" ? items.filter((item) => item.category === category) : items

    return NextResponse.json(filteredItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    // Always return a proper JSON response, never HTML
    return NextResponse.json({ error: "Failed to fetch menu items", details: String(error) }, { status: 500 })
  }
}

// Add a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = await getMenuItems()

    const newItem = {
      id: generateId(),
      title: body.title,
      description: body.description || "",
      price: Number.parseFloat(body.price),
      category: body.category,
      image: body.image || "/placeholder.svg?height=200&width=200",
      type: body.type,
      discount: body.discount ? Number.parseFloat(body.discount) : undefined,
      available: body.available !== false,
    }

    items.push(newItem)
    await redis.set("menu:items", items)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: "Failed to create menu item", details: String(error) }, { status: 500 })
  }
}

