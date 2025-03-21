"use client"

import { generateId } from "ai"

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

// Default data for initialization
const defaultCategories: Category[] = [
  { id: "cat1", name: "All", icon: "Grid" },
  { id: "cat2", name: "Breakfast", icon: "Coffee" },
  { id: "cat3", name: "Soups", icon: "Soup" },
  { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
  { id: "cat5", name: "Main Course", icon: "ChefHat" },
  { id: "cat6", name: "Burgers", icon: "Sandwich" },
]

const defaultMenuItems: MenuItem[] = [
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

const defaultTables: Table[] = [
  { id: "table1", number: "1", capacity: 4, status: "available" },
  { id: "table2", number: "2", capacity: 2, status: "available" },
  { id: "table3", number: "3", capacity: 6, status: "available" },
  { id: "table4", number: "4", capacity: 4, status: "occupied" },
]

const defaultStaff: Staff[] = [
  { id: "staff1", name: "Admin User", email: "admin@example.com", role: "admin", pin: "1234" },
  { id: "staff2", name: "Cashier User", email: "cashier@example.com", role: "cashier", pin: "5678" },
]

// Helper functions to get and set data from localStorage
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error)
    return defaultValue
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} to localStorage:`, error)
  }
}

// Initialize localStorage with default data if empty
export function initializeLocalStorage(): void {
  if (typeof window === "undefined") return

  if (!window.localStorage.getItem("menu:categories")) {
    setToLocalStorage("menu:categories", defaultCategories)
  }

  if (!window.localStorage.getItem("menu:items")) {
    setToLocalStorage("menu:items", defaultMenuItems)
  }

  if (!window.localStorage.getItem("tables")) {
    setToLocalStorage("tables", defaultTables)
  }

  if (!window.localStorage.getItem("staff")) {
    setToLocalStorage("staff", defaultStaff)
  }

  if (!window.localStorage.getItem("orders")) {
    setToLocalStorage("orders", [])
  }
}

// Data access functions
export function getMenuItems(): MenuItem[] {
  return getFromLocalStorage<MenuItem[]>("menu:items", [])
}

export function getCategories(): Category[] {
  return getFromLocalStorage<Category[]>("menu:categories", [])
}

export function getOrders(): Order[] {
  return getFromLocalStorage<Order[]>("orders", [])
}

export function getTables(): Table[] {
  return getFromLocalStorage<Table[]>("tables", [])
}

export function getStaff(): Staff[] {
  return getFromLocalStorage<Staff[]>("staff", [])
}

// Data mutation functions
export function addMenuItem(item: MenuItem): void {
  const items = getMenuItems()
  items.push(item)
  setToLocalStorage("menu:items", items)
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): void {
  const items = getMenuItems()
  const index = items.findIndex((item) => item.id === id)

  if (index !== -1) {
    items[index] = { ...items[index], ...updates }
    setToLocalStorage("menu:items", items)
  }
}

export function deleteMenuItem(id: string): void {
  const items = getMenuItems()
  const filteredItems = items.filter((item) => item.id !== id)
  setToLocalStorage("menu:items", filteredItems)
}

export function addOrder(order: Order): void {
  const orders = getOrders()
  orders.push(order)
  setToLocalStorage("orders", orders)

  // Update table status if it's a dine-in order
  if (order.diningMode === "Dine in") {
    const tables = getTables()
    const tableIndex = tables.findIndex((t) => t.number === order.tableNumber)

    if (tableIndex !== -1) {
      tables[tableIndex].status = "occupied"
      tables[tableIndex].currentOrderId = order.id
      setToLocalStorage("tables", tables)
    }
  }
}

export function updateOrder(id: string, updates: Partial<Order>): void {
  const orders = getOrders()
  const index = orders.findIndex((order) => order.id === id)

  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: Date.now() }
    setToLocalStorage("orders", orders)

    // If order is completed/paid and was dine-in, free up the table
    if ((updates.status === "paid" || updates.status === "cancelled") && orders[index].diningMode === "Dine in") {
      const tables = getTables()
      const tableIndex = tables.findIndex((t) => t.number === orders[index].tableNumber)

      if (tableIndex !== -1) {
        tables[tableIndex].status = "available"
        tables[tableIndex].currentOrderId = undefined
        setToLocalStorage("tables", tables)
      }
    }
  }
}

export function createOrder(orderData: {
  tableNumber: string
  customerName?: string
  items: OrderItem[]
  diningMode: "Dine in" | "Take Away" | "Delivery"
  staffId: string
}): Order {
  const { tableNumber, customerName, items, diningMode, staffId } = orderData

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + tax

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

  addOrder(newOrder)
  return newOrder
}

export function processPayment(
  orderId: string,
  paymentMethod: "Cash" | "Card" | "QR Code",
): { success: boolean; receipt?: any; error?: string } {
  const orders = getOrders()
  const index = orders.findIndex((order) => order.id === orderId)

  if (index === -1) {
    return { success: false, error: "Order not found" }
  }

  updateOrder(orderId, {
    paymentMethod,
    paymentStatus: "paid",
    status: "paid",
  })

  return {
    success: true,
    receipt: {
      orderId,
      total: orders[index].total,
      paymentMethod,
      date: new Date().toISOString(),
    },
  }
}

