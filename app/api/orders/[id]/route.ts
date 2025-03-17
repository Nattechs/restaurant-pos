import { NextResponse } from "next/server"
import { getOrders, redis, type Order } from "@/lib/db"

// Get a specific order
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orders = await getOrders()
    const order = orders.find((order) => order.id === params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// Update an order
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const orders = await getOrders()
    const index = orders.findIndex((order) => order.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Handle payment processing
    if (body.paymentMethod && body.paymentStatus === "paid") {
      // In a real app, you would integrate with a payment gateway here
      console.log(`Processing payment for order ${params.id} via ${body.paymentMethod}`)

      // If table is now free, update its status
      if (orders[index].diningMode === "Dine in") {
        const tables = (await redis.get<any[]>("tables")) || []
        const tableIndex = tables.findIndex((t) => t.number === orders[index].tableNumber)

        if (tableIndex !== -1) {
          tables[tableIndex].status = "available"
          tables[tableIndex].currentOrderId = undefined
          await redis.set("tables", tables)
        }
      }
    }

    const updatedOrder: Order = {
      ...orders[index],
      ...body,
      updatedAt: Date.now(),
    }

    orders[index] = updatedOrder
    await redis.set("orders", orders)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

