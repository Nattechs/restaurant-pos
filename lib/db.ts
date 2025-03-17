import { Redis } from "@upstash/redis"

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Data structure types
export type MenuItem = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  type: "Veg" | "Non Veg"
  discount?: number
  available: boolean
}

export type Category = {
  id: string
  name: string
  icon: string
}

export type Order = {
  id: string
  tableNumber: string
  customerName?: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled"
  diningMode: "Dine in" | "Take Away" | "Delivery"
  createdAt: number
  updatedAt: number
  total: number
  tax: number
  paymentMethod?: "Cash" | "Card" | "QR Code"
  paymentStatus: "pending" | "paid"
  staffId: string
}

export type OrderItem = {
  menuItemId: string
  title: string
  price: number
  quantity: number
  notes?: string
}

export type Table = {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
  currentOrderId?: string
}

export type Staff = {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "cashier" | "waiter" | "chef"
  pin: string
}

// Helper functions for data access
export async function getMenuItems(): Promise<MenuItem[]> {
  const items = (await redis.get<MenuItem[]>("menu:items")) || []
  return items
}

export async function getCategories(): Promise<Category[]> {
  const categories = (await redis.get<Category[]>("menu:categories")) || []
  return categories
}

export async function getOrders(status?: Order["status"]): Promise<Order[]> {
  const orders = (await redis.get<Order[]>("orders")) || []
  if (status) {
    return orders.filter((order) => order.status === status)
  }
  return orders
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await getOrders()
  return orders.find((order) => order.id === id) || null
}

export async function getTables(): Promise<Table[]> {
  const tables = (await redis.get<Table[]>("tables")) || []
  return tables
}

export async function getStaff(): Promise<Staff[]> {
  const staff = (await redis.get<Staff[]>("staff")) || []
  return staff
}

// Initialize demo data if needed
export async function seedDemoData() {
  const hasData = await redis.exists("menu:items")

  if (!hasData) {
    // Seed categories
    const categories: Category[] = [
      { id: "cat1", name: "All", icon: "Grid" },
      { id: "cat2", name: "Breakfast", icon: "Coffee" },
      { id: "cat3", name: "Soups", icon: "Soup" },
      { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
      { id: "cat5", name: "Main Course", icon: "ChefHat" },
      { id: "cat6", name: "Burgers", icon: "Sandwich" },
    ]

    // Seed menu items
    const menuItems: MenuItem[] = [
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
    const tables: Table[] = [
      { id: "table1", number: "1", capacity: 4, status: "available" },
      { id: "table2", number: "2", capacity: 2, status: "available" },
      { id: "table3", number: "3", capacity: 6, status: "available" },
      { id: "table4", number: "4", capacity: 4, status: "occupied" },
    ]

    // Seed staff
    const staff: Staff[] = [
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
}

