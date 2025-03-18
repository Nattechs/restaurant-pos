"use server"

import { addMenuItem } from "./actions"
import { redirect } from "next/navigation"

export async function createMenuItem(formData: FormData) {
  await addMenuItem(formData)
  redirect("/admin/menu")
}

