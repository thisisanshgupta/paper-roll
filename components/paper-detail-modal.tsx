"use client"

import { useEffect, memo } from "react"
import { X, ExternalLink, Heart, Calendar, Tag, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useFavorites } from "@/hooks/use-favorites"
import type { Paper } from "@/types/paper"
import { MathFormatter } from "@/components/math-formatter"

interface PaperDetailModalProps {
  paper: Paper
  isOpen: boolean
  onClose: () => void
}

export const PaperDetailModal = memo(function PaperDetailModal({ paper, isOpen, onClose }: PaperDetailModalProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const isFav = isFavorite(paper.id)

  const handleFavoriteClick = () => {
    if (isFav) {
      removeFavorite(paper.id)
    } else {
      addFavorite(paper)
    }
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
        month: "long",
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl pr-10 title-text">{paper.title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-0 top-0" aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
          <DialogDescription className="flex flex-wrap gap-2 items-center pt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDate(paper.published)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              Authors
            </h3>
            <p className="text-sm author-text">{paper.authors.join(", ")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-1">
              {paper.categories.map((category, index) => (
                <Badge key={index} variant="outline" className={`text-xs ${getCategoryClass(index)}`}>
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-1">Abstract</h3>
            <div className="text-sm whitespace-pre-line">
              <MathFormatter text={paper.summary} />
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-4">
            <Button variant={isFav ? "default" : "outline"} size="sm" onClick={handleFavoriteClick} className="gap-2">
              <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
              {isFav ? "Saved to Favorites" : "Save to Favorites"}
            </Button>

            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View on arXiv
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
