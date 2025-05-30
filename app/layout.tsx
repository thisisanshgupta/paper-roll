import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { FavoritesProvider } from "@/hooks/use-favorites"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Paper-Roll - Explore Research Papers",
  description: "Discover the latest research papers with a swipeable interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FavoritesProvider>
            {children}
            <Toaster />
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
