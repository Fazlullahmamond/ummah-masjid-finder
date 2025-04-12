"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Masjid } from "../types"

interface FavoritesContextType {
  favorites: Masjid[]
  addFavorite: (masjid: Masjid) => void
  removeFavorite: (id: string) => void
  clearFavorites: () => void
  isFavorite: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Masjid[]>([])

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem("favorites")
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }
      } catch (error) {
        console.error("Failed to load favorites:", error)
      }
    }

    loadFavorites()
  }, [])

  const saveFavorites = async (updatedFavorites: Masjid[]) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    } catch (error) {
      console.error("Failed to save favorites:", error)
    }
  }

  const addFavorite = (masjid: Masjid) => {
    if (!isFavorite(masjid.id)) {
      const updatedFavorites = [...favorites, masjid]
      setFavorites(updatedFavorites)
      saveFavorites(updatedFavorites)
    }
  }

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter((masjid) => masjid.id !== id)
    setFavorites(updatedFavorites)
    saveFavorites(updatedFavorites)
  }

  const clearFavorites = () => {
    setFavorites([])
    saveFavorites([])
  }

  const isFavorite = (id: string) => {
    return favorites.some((masjid) => masjid.id === id)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        clearFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
