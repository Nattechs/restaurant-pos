"use server"

import { redis, getMenuItems, getOrders, getTables, type MenuItem, type Order, type OrderItem } from "./db-local"
import { generateId } from "ai"
import { revalidatePath } from "next/cache"

// Create a new order
export async function createOrder(formData: FormData) {
  try {
    const tableNumber = formData.get("tableNumber") as string
    const customerName = formData.get("customerName") as string
    const diningMode = formData.get("diningMode") as "Dine in" | "Take Away" | "Delivery"
    const staffId = formData.get("staffId") as string

    // Parse items from form data
    const itemsJson = formData.get("items") as string
    const items = JSON.parse(itemsJson) as OrderItem[]

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.05 // 5% tax
    const total = subtotal + tax

    const orders = await getOrders()

    const newOrder: Order = {
      id: generateId(),
      tableNumber,
      customerName,
      items,
      status: "pending",
      diningMode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      total,
      tax,
      paymentStatus: "pending",
      staffId,
    }

    orders.push(newOrder)
    await redis.set("orders", orders)

    // Update table status if it's a dine-in order
    if (diningMode === "Dine in") {
      const tables = await getTables()
      const tableIndex = tables.findIndex((t) => t.number === tableNumber)

      if (tableIndex !== -1) {
        tables[tableIndex].status = "occupied"
        tables[tableIndex].currentOrderId = newOrder.id
        await redis.set("tables", tables)
      }
    }

    revalidatePath("/orders")
    revalidatePath("/")

    return { success: true, orderId: newOrder.id }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  try {
    const orders = await getOrders()
    const index = orders.findIndex((order) => order.id === orderId)

    if (index === -1) {
      return { success: false, error: "Order not found" }
    }

    orders[index].status = status
    orders[index].updatedAt = Date.now()

    await redis.set("orders", orders)

    // If order is completed/paid and was dine-in, free up the table
    if ((status === "paid" || status === "cancelled") && orders[index].diningMode === "Dine in") {
      const tables = await getTables()
      const tableIndex = tables.findIndex((t) => t.number === orders[index].tableNumber)

      if (tableIndex !== -1) {
        tables[tableIndex].status = "available"
        tables[tableIndex].currentOrderId = undefined
        await redis.set("tables", tables)
      }
    }

    revalidatePath("/orders")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

// Process payment
export async function processPayment(orderId: string, paymentMethod: "Cash" | "Card" | "QR Code") {
  try {
    const orders = await getOrders()
    const index = orders.findIndex((order) => order.id === orderId)

    if (index === -1) {
      return { success: false, error: "Order not found" }
    }

    // In a real app, you would integrate with a payment gateway here
    console.log(`Processing payment for order ${orderId} via ${paymentMethod}`)

    orders[index].paymentMethod = paymentMethod
    orders[index].paymentStatus = "paid"
    orders[index].status = "paid"
    orders[index].updatedAt = Date.now()

    await redis.set("orders", orders)

    // If it was a dine-in order, free up the table
    if (orders[index].diningMode === "Dine in") {
      const tables = await getTables()
      const tableIndex = tables.findIndex((t) => t.number === orders[index].tableNumber)

      if (tableIndex !== -1) {
        tables[tableIndex].status = "available"
        tables[tableIndex].currentOrderId = undefined
        await redis.set("tables", tables)
      }
    }

    revalidatePath("/orders")
    revalidatePath("/")

    return {
      success: true,
      receipt: {
        orderId,
        total: orders[index].total,
        paymentMethod,
        date: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error processing payment:", error)
    return { success: false, error: "Failed to process payment" }
  }
}

// Add item to menu
export async function addMenuItem(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const image = (formData.get("image") as string) || "/placeholder.svg?height=200&width=200"
    const type = formData.get("type") as "Veg" | "Non Veg"
    const discountStr = formData.get("discount") as string
    const discount = discountStr ? Number.parseFloat(discountStr) : undefined

    const items = await getMenuItems()

    const newItem: MenuItem = {
      id: generateId(),
      title,
      description,
      price,
      category,
      image,
      type,
      discount,
      available: true,
    }

    items.push(newItem)
    await redis.set("menu:items", items)

    revalidatePath("/menu")

    return { success: true, itemId: newItem.id }
  } catch (error) {
    console.error("Error adding menu item:", error)
    return { success: false, error: "Failed to add menu item" }
  }
}

// Initialize the database with demo data
export async function initializeDatabase() {
  const hasData = await redis.exists("menu:items")

  if (!hasData) {
    async function seedDemoData() {
      // Seed categories
      const categories = [
        { id: "cat1", name: "All", icon: "Grid" },
        { id: "cat2", name: "Breakfast", icon: "Coffee" },
        { id: "cat3", name: "Soups", icon: "Soup" },
        { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
        { id: "cat5", name: "Main Course", icon: "ChefHat" },
        { id: "cat6", name: "Burgers", icon: "Sandwich" },
      ]

      // Seed menu items
      const menuItems = [
        {
          id: "item1",
          title: "Tasty Vegetable Salad Healthy Diet",
          description: "Fresh vegetables with olive oil and vinaigrette",
          price: 17.99,
          category: "cat2",
          image: "/placeholder.svg?height=200&width=200",
          type: "Veg",
          discount: 20,
          available: true,
        },
        {
          id: "item2",
          title: "Original Chess Meat Burger With Chips",
          description: "Juicy beef patty with cheese and fries",
          price: 23.99,
          category: "cat6",
          image: "/placeholder.svg?height=200&width=200",
          type: "Non Veg",
          available: true,
        },
        // Add more items as needed
      ]

      // Seed tables
      const tables = [
        { id: "table1", number: "1", capacity: 4, status: "available" },
        { id: "table2", number: "2", capacity: 2, status: "available" },
        { id: "table3", number: "3", capacity: 6, status: "available" },
        { id: "table4", number: "4", capacity: "4", status: "occupied" },
      ]

      // Seed staff
      const staff = [
        { id: "staff1", name: "Admin User", email: "admin@example.com", role: "admin", pin: "1234" },
        { id: "staff2", name: "Cashier User", email: "cashier@example.com", role: "cashier", pin: "5678" },
      ]

      // Save to Redis
      await redis.set("menu:categories", categories)
      await redis.set("menu:items", menuItems)
      await redis.set("tables", tables)
      await redis.set("staff", staff)
      await redis.set("orders", [])
    }
    await seedDemoData()
    return { success: true, message: "Database initialized with demo data" }
  }

  return { success: false, message: "Database already initialized" }
}

