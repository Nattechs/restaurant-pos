"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type MenuItem,
  type OrderItem,
  getMenuItems,
  getTables,
  getOrders,
  createOrder as createLocalOrder,
  processPayment as processLocalPayment,
  initializeLocalStorage,
} from "@/lib/local-storage"

type POSContextType = {
  cart: OrderItem[]
  selectedTable: string
  customerName: string
  diningMode: "Dine in" | "Take Away" | "Delivery"
  menuItems: MenuItem[]
  tables: any[]
  activeOrders: any[]
  isLoading: boolean
  addToCart: (item: MenuItem, quantity: number) => void
  removeFromCart: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  clearCart: () => void
  setSelectedTable: (tableNumber: string) => void
  setCustomerName: (name: string) => void
  setDiningMode: (mode: "Dine in" | "Take Away" | "Delivery") => void
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>
  processPayment: (orderId: string, method: "Cash" | "Card" | "QR Code") => Promise<any>
  refreshData: () => Promise<void>
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("1")
  const [customerName, setCustomerName] = useState<string>("")
  const [diningMode, setDiningMode] = useState<"Dine in" | "Take Away" | "Delivery">("Dine in")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize localStorage on first render
  useEffect(() => {
    initializeLocalStorage()
    refreshData()
  }, [])

  async function refreshData() {
    setIsLoading(true)
    try {
      // Get data from localStorage
      const menuData = getMenuItems()
      const tablesData = getTables()
      const ordersData = getOrders().filter((order) => order.status === "pending")

      setMenuItems(menuData)
      setTables(tablesData)
      setActiveOrders(ordersData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function addToCart(item: MenuItem, quantity: number) {
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.menuItemId === item.id)

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      setCart(updatedCart)
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          title: item.title,
          price: item.price,
          quantity,
        },
      ])
    }
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index))
  }

  function updateQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }

    const updatedCart = [...cart]
    updatedCart[index].quantity = quantity
    setCart(updatedCart)
  }

  function clearCart() {
    setCart([])
  }

  async function placeOrder() {
    if (cart.length === 0) {
      return { success: false, error: "Cart is empty" }
    }

    try {
      const order = createLocalOrder({
        tableNumber: selectedTable,
        customerName,
        diningMode,
        staffId: "staff1", // In a real app, get this from auth context
        items: cart,
      })

      clearCart()
      await refreshData()
      return { success: true, orderId: order.id }
    } catch (error) {
      console.error("Error placing order:", error)
      return { success: false, error: "Failed to place order" }
    }
  }

  async function processPayment(orderId: string, method: "Cash" | "Card" | "QR Code") {
    try {
      const result = processLocalPayment(orderId, method)

      if (result.success) {
        await refreshData()
        return { success: true, receipt: result.receipt }
      } else {
        return { success: false, error: result.error || "Failed to process payment" }
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      return { success: false, error: "Failed to process payment" }
    }
  }

  const value = {
    cart,
    selectedTable,
    customerName,
    diningMode,
    menuItems,
    tables,
    activeOrders,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setSelectedTable,
    setCustomerName,
    setDiningMode,
    placeOrder,
    processPayment,
    refreshData,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export function usePOS() {
  const context = useContext(POSContext)
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider")
  }
  return context
}

