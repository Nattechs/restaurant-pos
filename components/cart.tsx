"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, QrCode, Banknote, Edit2, Trash2 } from "lucide-react"
import { usePOS } from "./pos-context"
import { useState } from "react"
import { CartItem } from "./cart-item"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Cart() {
  const {
    cart,
    selectedTable,
    customerName,
    diningMode,
    setCustomerName,
    setDiningMode,
    placeOrder,
    processPayment,
    removeFromCart,
  } = usePOS()

  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [tempCustomerName, setTempCustomerName] = useState(customerName)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handleSaveCustomer = () => {
    setCustomerName(tempCustomerName)
    setIsEditingCustomer(false)
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    const result = await placeOrder()
    setIsProcessing(false)

    if (result.success && result.orderId) {
      setCurrentOrderId(result.orderId)
      setIsPaymentDialogOpen(true)
    } else {
      alert(result.error || "Failed to place order")
    }
  }

  const handlePayment = async (method: "Cash" | "Card" | "QR Code") => {
    if (!currentOrderId) return

    setIsProcessing(true)
    const result = await processPayment(currentOrderId, method)
    setIsProcessing(false)

    if (result.success) {
      setIsPaymentDialogOpen(false)
      setReceipt(result.receipt)
      setReceiptDialogOpen(true)
    } else {
      alert(result.error || "Failed to process payment")
    }
  }

  return (
    <div className="w-[380px] bg-white border-l flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Table {selectedTable}</h2>
          <p className="text-sm text-gray-500">{customerName || "Guest"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditingCustomer(true)}>
          <Edit2 className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Button
            variant={diningMode === "Dine in" ? "secondary" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => setDiningMode("Dine in")}
          >
            Dine in
          </Button>
          <Button
            variant={diningMode === "Take Away" ? "secondary" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => setDiningMode("Take Away")}
          >
            Take Away
          </Button>
          <Button
            variant={diningMode === "Delivery" ? "secondary" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => setDiningMode("Delivery")}
          >
            Delivery
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Cart is empty. Add items to place an order.</div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="relative">
              <CartItem
                title={item.title}
                price={item.price}
                quantity={item.quantity}
                image="/placeholder.svg?height=64&width=64"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 text-red-500"
                onClick={() => removeFromCart(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="border-t p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax 5%</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
          onClick={handlePlaceOrder}
          disabled={cart.length === 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </div>

      {/* Customer Edit Dialog */}
      <Dialog open={isEditingCustomer} onOpenChange={setIsEditingCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={tempCustomerName}
                onChange={(e) => setTempCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center py-6"
              onClick={() => handlePayment("Cash")}
              disabled={isProcessing}
            >
              <Banknote className="h-8 w-8 mb-2" />
              <span>Cash</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center py-6"
              onClick={() => handlePayment("Card")}
              disabled={isProcessing}
            >
              <CreditCard className="h-8 w-8 mb-2" />
              <span>Card</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center py-6"
              onClick={() => handlePayment("QR Code")}
              disabled={isProcessing}
            >
              <QrCode className="h-8 w-8 mb-2" />
              <span>QR Code</span>
            </Button>
          </div>
          <div className="text-center font-bold">Total: ${total.toFixed(2)}</div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="py-4 space-y-4">
              <div className="text-center text-2xl font-bold text-green-600">Payment Successful</div>
              <div className="border-t border-b py-4 space-y-2">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span>{receipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500">Thank you for your order!</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

