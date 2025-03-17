import { NextResponse } from "next/server"
import { getStaff } from "@/lib/db"
import { cookies } from "next/headers"
import { generateId } from "ai"

// Staff login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, pin } = body

    const staff = await getStaff()
    const user = staff.find((s) => s.email === email && s.pin === pin)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a session (in a real app, use a proper auth system)
    const sessionId = generateId()
    const session = {
      id: sessionId,
      userId: user.id,
      name: user.name,
      role: user.role,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    // Store session in a cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

// Logout
export async function DELETE() {
  cookies().delete("session")
  return NextResponse.json({ success: true })
}

