import { NextResponse } from "next/server"
import { getOrders, redis, type Order, type OrderItem, getTables } from "@/lib/db-local"
import { generateId } from "ai"

// Get all orders with optional status filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as Order["status"] | null

    const orders = await getOrders(status || undefined)
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

// Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orders = await getOrders()

    // Calculate totals
    const items = body.items as OrderItem[]
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.05 // 5% tax
    const total = subtotal + tax

    const newOrder: Order = {
      id: generateId(),
      tableNumber: body.tableNumber,
      customerName: body.customerName,
      items: items,
      status: "pending",
      diningMode: body.diningMode || "Dine in",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      total: total,
      tax: tax,
      paymentStatus: "pending",
      staffId: body.staffId,
    }

    orders.push(newOrder)
    await redis.set("orders", orders)

    // Update table status if it's a dine-in order
    if (newOrder.diningMode === "Dine in") {
      const tables = await getTables()
      const tableIndex = tables.findIndex((t) => t.number === newOrder.tableNumber)

      if (tableIndex !== -1) {
        tables[tableIndex].status = "occupied"
        tables[tableIndex].currentOrderId = newOrder.id
        await redis.set("tables", tables)
      }
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

