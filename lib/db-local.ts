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

// In-memory database
class LocalDatabase {
  private menuItems: MenuItem[] = []
  private categories: Category[] = []
  private orders: Order[] = []
  private tables: Table[] = []
  private staff: Staff[] = []
  private initialized = false

  constructor() {
    // Initialize with demo data if not already initialized
    if (!this.initialized) {
      this.seedDemoData()
      this.initialized = true
    }
  }

  // Helper functions for data access
  async getMenuItems(): Promise<MenuItem[]> {
    return [...this.menuItems]
  }

  async getCategories(): Promise<Category[]> {
    return [...this.categories]
  }

  async getOrders(status?: Order["status"]): Promise<Order[]> {
    if (status) {
      return this.orders.filter((order) => order.status === status)
    }
    return [...this.orders]
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null
  }

  async getTables(): Promise<Table[]> {
    return [...this.tables]
  }

  async getStaff(): Promise<Staff[]> {
    return [...this.staff]
  }

  async setMenuItems(items: MenuItem[]): Promise<void> {
    this.menuItems = [...items]
  }

  async setCategories(categories: Category[]): Promise<void> {
    this.categories = [...categories]
  }

  async setOrders(orders: Order[]): Promise<void> {
    this.orders = [...orders]
  }

  async setTables(tables: Table[]): Promise<void> {
    this.tables = [...tables]
  }

  async setStaff(staff: Staff[]): Promise<void> {
    this.staff = [...staff]
  }

  async exists(key: string): Promise<boolean> {
    return this.initialized
  }

  // Initialize demo data
  async seedDemoData() {
    // Seed categories
    this.categories = [
      { id: "cat1", name: "All", icon: "Grid" },
      { id: "cat2", name: "Breakfast", icon: "Coffee" },
      { id: "cat3", name: "Soups", icon: "Soup" },
      { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
      { id: "cat5", name: "Main Course", icon: "ChefHat" },
      { id: "cat6", name: "Burgers", icon: "Sandwich" },
    ]

    // Seed menu items
    this.menuItems = [
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
      {
        id: "item3",
        title: "Tacos Salsa With Chickens Grilled",
        description: "Grilled chicken tacos with fresh salsa",
        price: 14.99,
        category: "cat5",
        image: "/placeholder.svg?height=200&width=200",
        type: "Non Veg",
        available: true,
      },
      {
        id: "item4",
        title: "Fresh Orange Juice With Basil Seed",
        description: "Freshly squeezed orange juice with basil seeds",
        price: 12.99,
        category: "cat2",
        image: "/placeholder.svg?height=200&width=200",
        type: "Veg",
        available: true,
      },
      {
        id: "item5",
        title: "Meat Sushi Maki With Tuna",
        description: "Fresh tuna sushi rolls with wasabi and soy sauce",
        price: 9.99,
        category: "cat5",
        image: "/placeholder.svg?height=200&width=200",
        type: "Non Veg",
        available: true,
      },
      {
        id: "item6",
        title: "Original Chess Burger With French Fries",
        description: "Vegetarian burger with cheese and crispy fries",
        price: 10.59,
        category: "cat6",
        image: "/placeholder.svg?height=200&width=200",
        type: "Veg",
        discount: 20,
        available: true,
      },
    ]

    // Seed tables
    this.tables = [
      { id: "table1", number: "1", capacity: 4, status: "available" },
      { id: "table2", number: "2", capacity: 2, status: "available" },
      { id: "table3", number: "3", capacity: 6, status: "available" },
      { id: "table4", number: "4", capacity: 4, status: "occupied" },
    ]

    // Seed staff
    this.staff = [
      { id: "staff1", name: "Admin User", email: "admin@example.com", role: "admin", pin: "1234" },
      { id: "staff2", name: "Cashier User", email: "cashier@example.com", role: "cashier", pin: "5678" },
    ]

    // Initialize orders as empty
    this.orders = []
  }
}

// Create and export a singleton instance
export const db = new LocalDatabase()

// Export functions that match the Redis interface for easy swapping
export async function getMenuItems(): Promise<MenuItem[]> {
  return db.getMenuItems()
}

export async function getCategories(): Promise<Category[]> {
  return db.getCategories()
}

export async function getOrders(status?: Order["status"]): Promise<Order[]> {
  return db.getOrders(status)
}

export async function getOrder(id: string): Promise<Order | null> {
  return db.getOrder(id)
}

export async function getTables(): Promise<Table[]> {
  return db.getTables()
}

export async function getStaff(): Promise<Staff[]> {
  return db.getStaff()
}

// Redis-like set function
async function redisSet(key: string, value: any): Promise<void> {
  if (key === "menu:items") {
    return db.setMenuItems(value)
  } else if (key === "menu:categories") {
    return db.setCategories(value)
  } else if (key === "orders") {
    return db.setOrders(value)
  } else if (key === "tables") {
    return db.setTables(value)
  } else if (key === "staff") {
    return db.setStaff(value)
  }
}

// Redis-like exists function
async function redisExists(key: string): Promise<boolean> {
  return db.exists(key)
}

// Initialize demo data
export async function seedDemoData() {
  return db.seedDemoData()
}

// Export a redis-like object for compatibility
export const redis = {\
  get: async <T>(key: string): Promise<T | null> => {
    if (key === 'menu:items') {
      return db.getMenuItems() as unknown as T
    } else if (key === 'menu:categories') {
      return db.getCategories() as unknown as T
    } else if (key === 'orders') {
      return db.getOrders() as unknown as T
    } else if (key === 'tables') {
      return db.getTables() as unknown as T
    } else if (key === 'staff') {
      return db.getStaff() as unknown as T
    }
    return null
  },
  set: redisSet,
  exists: redisExists
}

import { generateId } from "ai"

// Data structure types
export type MenuItemLS = {
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

export type CategoryLS = {
  id: string
  name: string
  icon: string
}

export type OrderLS = {
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

export type OrderItemLS = {
  menuItemId: string
  title: string
  price: number
  quantity: number
  notes?: string
}

export type TableLS = {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
  currentOrderId?: string
}

export type StaffLS = {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "cashier" | "waiter" | "chef"
  pin: string
}

// Default data for initialization
const defaultCategories: CategoryLS[] = [
  { id: "cat1", name: "All", icon: "Grid" },
  { id: "cat2", name: "Breakfast", icon: "Coffee" },
  { id: "cat3", name: "Soups", icon: "Soup" },
  { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
  { id: "cat5", name: "Main Course", icon: "ChefHat" },
  { id: "cat6", name: "Burgers", icon: "Sandwich" },
]

const defaultMenuItems: MenuItemLS[] = [
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

const defaultTables: TableLS[] = [
  { id: "table1", number: "1", capacity: 4, status: "available" },
  { id: "table2", number: "2", capacity: 2, status: "available" },
  { id: "table3", number: "3", capacity: 6, status: "available" },
  { id: "table4", number: "4", capacity: 4, status: "occupied" },
]

const defaultStaff: StaffLS[] = [
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
export function getMenuItems(): MenuItemLS[] {
  return getFromLocalStorage<MenuItemLS[]>("menu:items", [])
}

export function getCategories(): CategoryLS[] {
  return getFromLocalStorage<CategoryLS[]>("menu:categories", [])
}

export function getOrders(): OrderLS[] {
  return getFromLocalStorage<OrderLS[]>("orders", [])
}

export function getTables(): TableLS[] {
  return getFromLocalStorage<TableLS[]>("tables", [])
}

export function getStaff(): StaffLS[] {
  return getFromLocalStorage<StaffLS[]>("staff", [])
}

// Data mutation functions
export function addMenuItem(item: MenuItemLS): void {
  const items = getMenuItems()
  items.push(item)
  setToLocalStorage("menu:items", items)
}

export function updateMenuItem(id: string, updates: Partial<MenuItemLS>): void {
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

export function addOrder(order: OrderLS): void {
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

export function updateOrder(id: string, updates: Partial<OrderLS>): void {
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
}): OrderLS {
  const { tableNumber, customerName, items, diningMode, staffId } = orderData

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + tax

  const newOrder: OrderLS = {
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

