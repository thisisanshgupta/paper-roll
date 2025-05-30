"use client"

import { useState, useEffect } from "react"
import { motion, useAnimation, type PanInfo } from "framer-motion"
import { Heart, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Paper } from "@/types/paper"

export function PaperExplorer() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Paper[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const controls = useAnimation()
  const { toast } = useToast()

  useEffect(() => {
    fetchPapers()
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/papers")
      const data = await response.json()
      setPapers(data)
    } catch (error) {
      console.error("Error fetching papers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch papers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      // Swiped right - like
      likePaper()
    } else if (info.offset.x < -threshold) {
      // Swiped left - skip
      skipPaper()
    } else {
      // Reset position if not swiped far enough
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } })
    }
  }

  const likePaper = () => {
    if (papers.length === 0 || currentIndex >= papers.length) return

    const paper = papers[currentIndex]

    // Add to favorites if not already there
    if (!favorites.some((fav) => fav.id === paper.id)) {
      setFavorites([...favorites, paper])

      toast({
        title: "Added to favorites",
        description: `"${paper.title.substring(0, 30)}..." has been added to your favorites.`,
      })
    }

    // Move to next paper with animation
    controls
      .start({
        x: "100vw",
        opacity: 0,
        transition: { duration: 0.3 },
      })
      .then(() => {
        setCurrentIndex((prev) => prev + 1)
        controls.set({ x: 0, opacity: 1 })
      })
  }

  const skipPaper = () => {
    if (papers.length === 0 || currentIndex >= papers.length) return

    // Move to next paper with animation
    controls
      .start({
        x: "-100vw",
        opacity: 0,
        transition: { duration: 0.3 },
      })
      .then(() => {
        setCurrentIndex((prev) => prev + 1)
        controls.set({ x: 0, opacity: 1 })
      })
  }

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites)
    setCurrentIndex(0)
  }

  const currentPapers = showFavorites ? favorites : papers
  const currentPaper = currentPapers[currentIndex]
  const isEnd = currentIndex >= currentPapers.length

  if (loading) {
    return (
      <div className="w-full">
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isEnd) {
    return (
      <div className="w-full text-center">
        <Card className="w-full p-8 flex flex-col items-center justify-center">
          <RefreshCw className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">
            {showFavorites ? "You've viewed all your favorites" : "You've viewed all available papers"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {showFavorites
              ? "Switch back to discover more papers or check again later."
              : "Check back later for more research papers or view your favorites."}
          </p>
          <div className="flex gap-4">
            {showFavorites && (
              <Button
                onClick={() => {
                  setShowFavorites(false)
                  setCurrentIndex(0)
                }}
              >
                Discover More
              </Button>
            )}
            {!showFavorites && <Button onClick={fetchPapers}>Refresh Papers</Button>}
            <Button variant={showFavorites ? "outline" : "default"} onClick={toggleFavorites}>
              {showFavorites ? "Back to Discovery" : "View Favorites"}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" onClick={toggleFavorites} className={showFavorites ? "text-primary" : ""}>
          {showFavorites ? "Viewing Favorites" : "Discover"}
        </Button>
        <Badge variant="outline">
          {currentIndex + 1} / {currentPapers.length}
        </Badge>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="touch-manipulation"
      >
        <Card className="w-full overflow-hidden border-2">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-bold line-clamp-2">{currentPaper.title}</h2>
            <p className="text-sm text-muted-foreground">{new Date(currentPaper.published).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-1 mb-3">
              {currentPaper.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-sm line-clamp-6">{currentPaper.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={skipPaper}
              className="rounded-full h-12 w-12 border-2 border-destructive/30 hover:border-destructive hover:bg-destructive/10"
            >
              <X className="h-6 w-6 text-destructive" />
            </Button>
            <div className="text-xs text-center text-muted-foreground">Swipe or use buttons</div>
            <Button
              variant="outline"
              size="icon"
              onClick={likePaper}
              className="rounded-full h-12 w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Heart className="h-6 w-6 text-primary" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="mt-4 text-sm">
        <a href={currentPaper.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Read full paper →
        </a>
      </div>
    </div>
  )
}
