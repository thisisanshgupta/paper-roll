"use client"

import { useEffect } from "react"
import { FallbackError } from "@/components/fallback-error"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return <FallbackError error={error} resetErrorBoundary={reset} />
}
