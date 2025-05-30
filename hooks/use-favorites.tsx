"use client"

import type React from "react"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import type { Paper } from "@/types/paper"

interface FavoritesContextType {
  favorites: Paper[]
  addFavorite: (paper: Paper) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Paper[]>([])
  const [initialized, setInitialized] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setInitialized(true)
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites, initialized])

  const addFavorite = useCallback((paper: Paper) => {
    setFavorites((prev) => {
      // Don't add if already in favorites
      if (prev.some((p) => p.id === paper.id)) {
        return prev
      }
      return [...prev, paper]
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((paper) => paper.id !== id))
  }, [])

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((paper) => paper.id === id)
    },
    [favorites],
  )

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
