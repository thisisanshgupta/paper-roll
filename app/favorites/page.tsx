"use client"

import { useState } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaperDetailModal } from "@/components/paper-detail-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { FavoritesButton } from "@/components/favorites-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFavorites } from "@/hooks/use-favorites"
import type { Paper } from "@/types/paper"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites } = useFavorites()
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  const openPaperDetail = (paper: Paper) => {
    setSelectedPaper(paper)
  }

  const closePaperDetail = () => {
    setSelectedPaper(null)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md pb-4 pt-2 border-b border-border/40 mb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Go back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold title-text">Favorites</h1>
            </div>
            <div className="flex items-center gap-3">
              <FavoritesButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex-1 w-full">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 title-text">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">Save papers you like by clicking the heart icon</p>
              <Button onClick={() => router.push("/")}>Discover Papers</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {favorites.map((paper) => (
                <div key={paper.id} className="transform-gpu">
                  <PaperCard paper={paper} onClick={() => openPaperDetail(paper)} />
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="py-6 text-center text-sm text-muted-foreground">Your saved research papers</footer>
      </div>

      {selectedPaper && <PaperDetailModal paper={selectedPaper} isOpen={!!selectedPaper} onClose={closePaperDetail} />}
    </main>
  )
}
