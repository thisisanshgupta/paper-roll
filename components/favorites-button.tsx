"use client"

import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export function FavoritesButton() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { favorites } = useFavorites()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigateToFavorites = () => {
    router.push("/favorites")
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative border-primary/20">
        <Heart className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">View favorites</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={navigateToFavorites}
      className="relative border-primary/20"
      aria-label="View favorites"
    >
      <Heart className="h-[1.2rem] w-[1.2rem]" />
      {favorites.length > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          variant="default"
        >
          {favorites.length > 99 ? "99+" : favorites.length}
        </Badge>
      )}
      <span className="sr-only">View favorites</span>
    </Button>
  )
}
