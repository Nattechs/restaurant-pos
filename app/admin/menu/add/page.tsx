"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCategories } from "@/lib/db"
import { addMenuItem } from "@/lib/actions"
import { redirect } from "next/navigation"

export default async function AddMenuItemPage() {
  const categories = await getCategories()

  async function createMenuItem(formData: FormData) {
    "use server"
    await addMenuItem(formData)
    redirect("/admin/menu")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Add Menu Item</h1>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <form action={createMenuItem}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Name</Label>
                  <Input id="title" name="title" placeholder="Enter item name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter item description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input id="discount" name="discount" type="number" min="0" max="100" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Veg">Vegetarian</SelectItem>
                        <SelectItem value="Non Veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" name="image" placeholder="Enter image URL" />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => history.back()}>
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

