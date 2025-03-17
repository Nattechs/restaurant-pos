import { NextResponse } from "next/server"
import { getOrders } from "@/lib/db"

// Get sales reports
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "day"

  try {
    const orders = await getOrders()
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid")

    // Calculate time boundaries
    const now = Date.now()
    let startTime: number

    switch (period) {
      case "day":
        startTime = now - 24 * 60 * 60 * 1000 // Last 24 hours
        break
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000 // Last 7 days
        break
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000 // Last 30 days
        break
      default:
        startTime = now - 24 * 60 * 60 * 1000 // Default to day
    }

    // Filter orders by time period
    const filteredOrders = paidOrders.filter((order) => order.createdAt >= startTime)

    // Calculate totals
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const totalTax = filteredOrders.reduce((sum, order) => sum + order.tax, 0)

    // Group by payment method
    const paymentMethods = filteredOrders.reduce(
      (acc, order) => {
        const method = order.paymentMethod || "Unknown"
        acc[method] = (acc[method] || 0) + order.total
        return acc
      },
      {} as Record<string, number>,
    )

    // Group by dining mode
    const diningModes = filteredOrders.reduce(
      (acc, order) => {
        acc[order.diningMode] = (acc[order.diningMode] || 0) + order.total
        return acc
      },
      {} as Record<string, number>,
    )

    // Get top selling items
    const itemSales = filteredOrders.flatMap((order) =>
      order.items.map((item) => ({
        id: item.menuItemId,
        title: item.title,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
      })),
    )

    const topItems = Object.values(
      itemSales.reduce(
        (acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              id: item.id,
              title: item.title,
              quantity: 0,
              revenue: 0,
            }
          }
          acc[item.id].quantity += item.quantity
          acc[item.id].revenue += item.revenue
          return acc
        },
        {} as Record<string, any>,
      ),
    )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      period,
      orderCount: filteredOrders.length,
      totalSales,
      totalTax,
      paymentMethods,
      diningModes,
      topItems,
    })
  } catch (error) {
    console.error("Error generating sales report:", error)
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 })
  }
}

