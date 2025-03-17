import { NextResponse } from "next/server"
import { getMenuItems, redis, type MenuItem } from "@/lib/db"

// Get a specific menu item
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const items = await getMenuItems()
    const item = items.find((item) => item.id === params.id)

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 })
  }
}

// Update a menu item
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const items = await getMenuItems()
    const index = items.findIndex((item) => item.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    const updatedItem: MenuItem = {
      ...items[index],
      title: body.title || items[index].title,
      description: body.description || items[index].description,
      price: body.price !== undefined ? Number.parseFloat(body.price) : items[index].price,
      category: body.category || items[index].category,
      image: body.image || items[index].image,
      type: body.type || items[index].type,
      discount: body.discount !== undefined ? Number.parseFloat(body.discount) : items[index].discount,
      available: body.available !== undefined ? body.available : items[index].available,
    }

    items[index] = updatedItem
    await redis.set("menu:items", items)

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

// Delete a menu item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const items = await getMenuItems()
    const filteredItems = items.filter((item) => item.id !== params.id)

    if (filteredItems.length === items.length) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    await redis.set("menu:items", filteredItems)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}

