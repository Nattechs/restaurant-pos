import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { POSProvider } from "@/components/pos-context-local"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Restaurant POS System",
  description: "A modern POS system for restaurants",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <POSProvider>{children}</POSProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'