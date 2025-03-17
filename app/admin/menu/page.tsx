import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getMenuItems, getCategories } from "@/lib/db"
import { Plus, Edit, Trash } from "lucide-react"
import Link from "next/link"

export default async function MenuManagementPage() {
  const menuItems = await getMenuItems()
  const categories = await getCategories()

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <Link href="/admin/menu/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <div className="relative h-40">
                  <img
                    src={item.image || "/placeholder.svg?height=160&width=320"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.discount && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
                      {item.discount}% Off
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="ghost" size="icon" className="bg-white rounded-full h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-white rounded-full h-8 w-8 text-red-500">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold">${item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${item.type === "Veg" ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      <span className="text-xs text-gray-500">{item.type}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Category: {categories.find((c) => c.id === item.category)?.name || "Uncategorized"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

