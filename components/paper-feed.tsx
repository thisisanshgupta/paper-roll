"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { PaperCard } from "@/components/paper-card"
import { PaperDetailModal } from "@/components/paper-detail-modal"
import { useToast } from "@/components/ui/use-toast"
import type { Paper } from "@/types/paper"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const PaperFeed = memo(function PaperFeed() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  const pageSize = 20 // Load 20 papers per page

  const fetchPapers = useCallback(
    async (pageNum: number) => {
      if (loading && !initialLoad) return

      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching papers: page=${pageNum}, pageSize=${pageSize}`)

        const params = new URLSearchParams({
          page: pageNum.toString(),
          pageSize: pageSize.toString(),
        })

        const response = await fetch(`/api/papers?${params.toString()}`)
        console.log(`API response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Received data: ${Array.isArray(data) ? `${data.length} papers` : "not an array"}`)

        // Check if we got an error response
        if (data.error) {
          throw new Error(data.error)
        }

        // Check if we got an empty array or invalid data
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from API")
        }

        if (data.length === 0) {
          console.log(`No papers returned for page ${pageNum}`)
          setHasMore(false)
          if (pageNum === 1) {
            // If it's the first page and we got no results, show an error
            if (retryCount < 3) {
              console.log(`Auto-retrying (${retryCount + 1}/3)...`)
              setRetryCount((prev) => prev + 1)
              // Wait a moment before retrying
              setTimeout(() => {
                fetchPapers(pageNum)
              }, 2000)
              return
            } else {
              setError("No papers available from arXiv. Please try again later.")
              setPapers([])
            }
          }
        } else {
          console.log(`Successfully loaded ${data.length} papers`)
          setRetryCount(0) // Reset retry count on success

          setPapers((prev) => {
            if (pageNum === 1) {
              return data
            } else {
              // Filter out duplicates when appending
              const newPapers = data.filter((paper: Paper) => !prev.some((p) => p.id === paper.id))
              return [...prev, ...newPapers]
            }
          })
          setHasMore(data.length === pageSize)
        }
      } catch (error) {
        console.error("Error fetching papers:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch papers")
        toast({
          title: "Error fetching papers",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    },
    [loading, initialLoad, pageSize, toast, retryCount],
  )

  // Initial load
  useEffect(() => {
    if (initialLoad) {
      fetchPapers(1)
    }
  }, [fetchPapers, initialLoad])

  const loadMorePapers = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPapers(nextPage)
    }
  }, [fetchPapers, loading, hasMore, page])

  const refreshPapers = useCallback(() => {
    setPage(1)
    setHasMore(true)
    setInitialLoad(true)
    setRetryCount(0)
    setPapers([])
  }, [])

  const openPaperDetail = useCallback((paper: Paper) => {
    setSelectedPaper(paper)
  }, [])

  const closePaperDetail = useCallback(() => {
    setSelectedPaper(null)
  }, [])

  // Render loading state
  if (loading && initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <LoadingSpinner size={32} className="text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2 title-text">Loading Papers</h3>
        <p className="text-muted-foreground mb-4">Fetching the latest research from arXiv...</p>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={refreshPapers} variant="default" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Render empty state
  if (papers.length === 0 && !loading && !initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RefreshCw className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2 title-text">No Papers Found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any papers from arXiv at the moment. This could be due to:
        </p>
        <ul className="text-muted-foreground mb-4 text-left list-disc pl-8 max-w-md">
          <li>Temporary arXiv API issues</li>
          <li>Network connectivity problems</li>
          <li>Rate limiting from the arXiv service</li>
        </ul>
        <Button onClick={refreshPapers} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-[200px]">
        {/* Papers grid */}
        {papers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {papers.map((paper) => (
              <div key={paper.id} className="transform-gpu">
                <PaperCard paper={paper} onClick={() => openPaperDetail(paper)} />
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for more papers */}
        {loading && !initialLoad && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size={24} className="text-primary mr-2" />
            <span className="text-muted-foreground text-sm">Loading more papers...</span>
          </div>
        )}

        {/* Load more button */}
        {papers.length > 0 && !loading && (
          <div className="flex justify-center py-6">
            {hasMore ? (
              <Button onClick={loadMorePapers} disabled={loading} className="min-w-[150px]">
                {loading ? (
                  <>
                    <LoadingSpinner size={16} className="mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load more papers"
                )}
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">You've reached the end of the results</p>
                <Button variant="outline" size="sm" onClick={refreshPapers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Papers
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPaper && <PaperDetailModal paper={selectedPaper} isOpen={!!selectedPaper} onClose={closePaperDetail} />}
    </>
  )
})
