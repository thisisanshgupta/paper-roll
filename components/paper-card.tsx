"use client"

import type React from "react"

import { useState, useEffect, memo } from "react"
import { Heart, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import type { Paper } from "@/types/paper"
import { MathFormatter } from "@/components/math-formatter"

interface PaperCardProps {
  paper: Paper
  onClick: () => void
}

export const PaperCard = memo(function PaperCard({ paper, onClick }: PaperCardProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    setIsFav(isFavorite(paper.id))
  }, [paper.id, isFavorite])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isFav) {
      removeFavorite(paper.id)
    } else {
      addFavorite(paper)
    }

    setIsFav(!isFav)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "Unknown date"
    }
  }

  // Function to get category class based on index
  const getCategoryClass = (index: number) => {
    const classes = ["category-1", "category-2", "category-3", "category-4"]
    return classes[index % classes.length]
  }

  return (
    <Card
      className="h-full transition-all hover:shadow-md cursor-pointer overflow-hidden border hover:border-primary/20 will-change-transform paper-card"
      onClick={onClick}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div className="pr-2">
          <h2 className="text-lg font-bold line-clamp-2 title-text">{paper.title}</h2>
          <p className="text-sm text-muted-foreground">{formatDate(paper.published)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full flex-shrink-0 ${isFav ? "text-primary" : "text-muted-foreground"}`}
          onClick={handleFavoriteClick}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Authors section - improved visibility with color */}
        <div className="mb-3 text-sm">
          <h3 className="font-medium mb-1">Authors:</h3>
          <div className="flex flex-wrap gap-1 author-text">
            {paper.authors.slice(0, 3).map((author, index) => (
              <span key={index}>
                {author}
                {index < Math.min(paper.authors.length, 3) - 1 && ", "}
              </span>
            ))}
            {paper.authors.length > 3 && <span>et al.</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {paper.categories.slice(0, 3).map((category, index) => (
            <Badge key={index} variant="outline" className={`text-xs ${getCategoryClass(index)}`}>
              {category}
            </Badge>
          ))}
          {paper.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{paper.categories.length - 3}
            </Badge>
          )}
        </div>

        <div className="text-sm line-clamp-3">
          <MathFormatter text={paper.summary} />
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between items-center">
        <span className="text-xs text-primary">Tap to read more</span>
        <a
          href={paper.arxivUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
          arXiv
        </a>
      </CardFooter>
    </Card>
  )
})
