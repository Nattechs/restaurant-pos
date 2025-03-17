import { NextResponse } from "next/server"
import { getTables, redis } from "@/lib/db-local"
import { generateId } from "ai"

// Get all tables
export async function GET() {
  try {
    const tables = await getTables()
    return NextResponse.json(tables)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tables",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

// Add a new table
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tables = await getTables()

    const newTable = {
      id: generateId(),
      number: body.number,
      capacity: Number.parseInt(body.capacity) || 4,
      status: "available",
    }

    tables.push(newTable)
    await redis.set("tables", tables)

    return NextResponse.json(newTable, { status: 201 })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json(
      {
        error: "Failed to create table",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

