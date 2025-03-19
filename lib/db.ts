"use client";

import { generateId } from "ai";

// Data structure types
export type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  type: "Veg" | "Non Veg";
  discount?: number;
  available: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Order = {
  id: string;
  tableNumber: string;
  customerName?: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";
  diningMode: "Dine in" | "Take Away" | "Delivery";
  createdAt: number;
  updatedAt: number;
  total: number;
  tax: number;
  paymentMethod?: "Cash" | "Card" | "QR Code";
  paymentStatus: "pending" | "paid";
  staffId: string;
};

export type OrderItem = {
  menuItemId: string;
  title: string;
  price: number;
  quantity: number;
  notes?: string;
};

export type Table = {
  id: string;
  number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentOrderId?: string;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "waiter" | "chef";
  pin: string;
};

// Helper functions for localStorage
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} to localStorage:`, error);
  }
}

// Helper functions for data access
export async function getMenuItems(): Promise<MenuItem[]> {
  return getFromLocalStorage<MenuItem[]>("menu:items", []);
}

export async function getCategories(): Promise<Category[]> {
  return getFromLocalStorage<Category[]>("menu:categories", []);
}

export async function getOrders(status?: Order["status"]): Promise<Order[]> {
  const orders = getFromLocalStorage<Order[]>("orders", []);
  if (status) {
    return orders.filter((order) => order.status === status);
  }
  return orders;
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = getFromLocalStorage<Order[]>("orders", []);
  return orders.find((order) => order.id === id) || null;
}

export async function getTables(): Promise<Table[]> {
  return getFromLocalStorage<Table[]>("tables", []);
}

export async function getStaff(): Promise<Staff[]> {
  return getFromLocalStorage<Staff[]>("staff", []);
}

// Data mutation functions
export async function addMenuItem(item: MenuItem): Promise<void> {
  const items = await getMenuItems();
  items.push(item);
  setToLocalStorage("menu:items", items);
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const items = await getMenuItems();
  const index = items.findIndex((item) => item.id === id);

  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setToLocalStorage("menu:items", items);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const items = await getMenuItems();
  const filteredItems = items.filter((item) => item.id !== id);
  setToLocalStorage("menu:items", filteredItems);
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.push(order);
  setToLocalStorage("orders", orders);

  // Update table status if it's a dine-in order
  if (order.diningMode === "Dine in") {
    const tables = await getTables();
    const tableIndex = tables.findIndex((t) => t.number === order.tableNumber);

    if (tableIndex !== -1) {
      tables[tableIndex].status = "occupied";
      tables[tableIndex].currentOrderId = order.id;
      setToLocalStorage("tables", tables);
    }
  }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  const orders = await getOrders();
  const index = orders.findIndex((order) => order.id === id);

  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: Date.now() };
    setToLocalStorage("orders", orders);

    // If order is completed/paid and was dine-in, free up the table
    if ((updates.status === "paid" || updates.status === "cancelled") && orders[index].diningMode === "Dine in") {
      const tables = await getTables();
      const tableIndex = tables.findIndex((t) => t.number === orders[index].tableNumber);

      if (tableIndex !== -1) {
        tables[tableIndex].status = "available";
        tables[tableIndex].currentOrderId = undefined;
        setToLocalStorage("tables", tables);
      }
    }
  }
}

export async function createOrder(orderData: {
  tableNumber: string;
  customerName?: string;
  items: OrderItem[];
  diningMode: "Dine in" | "Take Away" | "Delivery";
  staffId: string;
}): Promise<Order> {
  const { tableNumber, customerName, items, diningMode, staffId } = orderData;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

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
  };

  await addOrder(newOrder);
  return newOrder;
}

export async function processPayment(
  orderId: string,
  paymentMethod: "Cash" | "Card" | "QR Code"
): Promise<{ success: boolean; receipt?: any; error?: string }> {
  const orders = await getOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    return { success: false, error: "Order not found" };
  }

  await updateOrder(orderId, {
    paymentMethod,
    paymentStatus: "paid",
    status: "paid",
  });

  return {
    success: true,
    receipt: {
      orderId,
      total: orders[index].total,
      paymentMethod,
      date: new Date().toISOString(),
    },
  };
}

// Initialize demo data if needed
export async function seedDemoData(): Promise<void> {
  const hasData = getFromLocalStorage<boolean>("data:initialized", false);

  if (!hasData) {
    // Seed categories
    const categories: Category[] = [
      { id: "cat1", name: "All", icon: "Grid" },
      { id: "cat2", name: "Breakfast", icon: "Coffee" },
      { id: "cat3", name: "Soups", icon: "Soup" },
      { id: "cat4", name: "Pasta", icon: "UtensilsCrossed" },
      { id: "cat5", name: "Main Course", icon: "ChefHat" },
      { id: "cat6", name: "Burgers", icon: "Sandwich" },
    ];

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
    ];

    // Seed tables
    const tables: Table[] = [
      { id: "table1", number: "1", capacity: 4, status: "available" },
      { id: "table2", number: "2", capacity: 2, status: "available" },
      { id: "table3", number: "3", capacity: 6, status: "available" },
      { id: "table4", number: "4", capacity: 4, status: "occupied" },
    ];

    // Seed staff
    const staff: Staff[] = [
      { id: "staff1", name: "Admin User", email: "admin@example.com", role: "admin", pin: "1234" },
      { id: "staff2", name: "Cashier User", email: "cashier@example.com", role: "cashier", pin: "5678" },
    ];

    // Save to localStorage
    setToLocalStorage("menu:categories", categories);
    setToLocalStorage("menu:items", menuItems);
    setToLocalStorage("tables", tables);
    setToLocalStorage("staff", staff);
    setToLocalStorage("orders", []);
    setToLocalStorage("data:initialized", true);
  }
}

// Mock Redis interface for compatibility with existing code
export const redis = {
  get: async <T>(key: string): Promise<T | null> => {
    if (key === "menu:items") {
      return getFromLocalStorage<MenuItem[]>("menu:items", []) as unknown as T;
    } else if (key === "menu:categories") {
      return getFromLocalStorage<Category[]>("menu:categories", []) as unknown as T;
    } else if (key === "orders") {
      return getFromLocalStorage<Order[]>("orders", []) as unknown as T;
    } else if (key === "tables") {
      return getFromLocalStorage<Table[]>("tables", []) as unknown as T;
    } else if (key === "staff") {
      return getFromLocalStorage<Staff[]>("staff", []) as unknown as T;
    }
    return null;
  },
  set: async (key: string, value: any): Promise<void> => {
    setToLocalStorage(key, value);
  },
  exists: async (key: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(key) !== null;
  }
};

// Initialize data on import
if (typeof window !== "undefined") {
  seedDemoData();
}
