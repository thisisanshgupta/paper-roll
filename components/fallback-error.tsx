"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface FallbackErrorProps {
  error?: Error | null
  resetErrorBoundary?: () => void
}

export function FallbackError({ error, resetErrorBoundary }: FallbackErrorProps) {
  const [errorMessage, setErrorMessage] = useState<string>("An unexpected error occurred")

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred")
      // Log the error to help with debugging
      console.error("Application error:", error)
    }
  }, [error])

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary()
    } else {
      // If no reset function is provided, refresh the page
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4 text-center">
      <Alert variant="destructive" className="mb-4 max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>

      <p className="text-muted-foreground mb-4 max-w-md">
        We're sorry for the inconvenience. Please try again or refresh the page.
      </p>

      <Button onClick={handleReset} variant="default">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}
