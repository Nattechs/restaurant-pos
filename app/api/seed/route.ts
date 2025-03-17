import { NextResponse } from "next/server"
import { seedDemoData } from "@/lib/db-local"

// Endpoint to initialize the database with demo data
export async function POST() {
  try {
    await seedDemoData()
    return NextResponse.json({ success: true, message: "Database seeded with demo data" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

// Also add a GET endpoint for easier initialization
export async function GET() {
  try {
    await seedDemoData()
    return NextResponse.json({ success: true, message: "Database seeded with demo data" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

