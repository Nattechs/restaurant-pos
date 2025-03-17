import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOrders } from "@/lib/db"
import { updateOrderStatus } from "@/lib/actions"

export default async function KitchenDisplayPage() {
  // Get pending and preparing orders
  const allOrders = await getOrders()
  const pendingOrders = allOrders.filter((order) => order.status === "pending")
  const preparingOrders = allOrders.filter((order) => order.status === "preparing")

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Kitchen Display</h1>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Orders ({pendingOrders.length})</h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between">
                        <span>Table {order.tableNumber}</span>
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {order.diningMode}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <form
                        action={async () => {
                          "use server"
                          await updateOrderStatus(order.id, "preparing")
                        }}
                      >
                        <Button type="submit" className="w-full">
                          Start Preparing
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                ))}
                {pendingOrders.length === 0 && <p className="text-gray-500 text-center py-8">No pending orders</p>}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Preparing ({preparingOrders.length})</h2>
              <div className="space-y-4">
                {preparingOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between">
                        <span>Table {order.tableNumber}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{order.diningMode}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <form
                        action={async () => {
                          "use server"
                          await updateOrderStatus(order.id, "ready")
                        }}
                      >
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                          Mark as Ready
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                ))}
                {preparingOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No orders being prepared</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

