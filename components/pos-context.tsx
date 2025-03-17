"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { MenuItem, Order, OrderItem, Table } from "@/lib/db"

type POSContextType = {
  cart: OrderItem[]
  selectedTable: string
  customerName: string
  diningMode: "Dine in" | "Take Away" | "Delivery"
  menuItems: MenuItem[]
  tables: Table[]
  activeOrders: Order[]
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
  const [tables, setTables] = useState<Table[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch initial data
  useEffect(() => {
    refreshData()
  }, [])

  async function refreshData() {
    setIsLoading(true)
    try {
      // Fetch menu items
      try {
        const menuResponse = await fetch("/api/menu")
        if (!menuResponse.ok) {
          throw new Error(`Menu API returned ${menuResponse.status}: ${await menuResponse.text()}`)
        }
        const menuData = await menuResponse.json()
        setMenuItems(menuData)
      } catch (menuError) {
        console.error("Error fetching menu items:", menuError)
        // Use empty array as fallback
        setMenuItems([])
      }

      // Fetch tables
      try {
        const tablesResponse = await fetch("/api/tables")
        if (!tablesResponse.ok) {
          throw new Error(`Tables API returned ${tablesResponse.status}`)
        }
        const tablesData = await tablesResponse.json()
        setTables(tablesData)
      } catch (tablesError) {
        console.error("Error fetching tables:", tablesError)
        // Use empty array as fallback
        setTables([])
      }

      // Fetch active orders
      try {
        const ordersResponse = await fetch("/api/orders?status=pending")
        if (!ordersResponse.ok) {
          throw new Error(`Orders API returned ${ordersResponse.status}`)
        }
        const ordersData = await ordersResponse.json()
        setActiveOrders(ordersData)
      } catch (ordersError) {
        console.error("Error fetching orders:", ordersError)
        // Use empty array as fallback
        setActiveOrders([])
      }
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

    const formData = new FormData()
    formData.append("tableNumber", selectedTable)
    formData.append("customerName", customerName)
    formData.append("diningMode", diningMode)
    formData.append("staffId", "staff1") // In a real app, get this from auth context
    formData.append("items", JSON.stringify(cart))

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          tableNumber: selectedTable,
          customerName,
          diningMode,
          staffId: "staff1", // In a real app, get this from auth context
          items: cart,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        await refreshData()
        return { success: true, orderId: data.id }
      } else {
        return { success: false, error: data.error || "Failed to place order" }
      }
    } catch (error) {
      console.error("Error placing order:", error)
      return { success: false, error: "Network error" }
    }
  }

  async function processPayment(orderId: string, method: "Cash" | "Card" | "QR Code") {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({
          paymentMethod: method,
          paymentStatus: "paid",
          status: "paid",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        await refreshData()
        return { success: true, receipt: data }
      } else {
        return { success: false, error: data.error || "Failed to process payment" }
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      return { success: false, error: "Network error" }
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

