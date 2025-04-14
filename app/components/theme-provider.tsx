"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function ThemeProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value?: Theme
}) {
  const colorScheme = useColorScheme()
  const [theme, setThemeState] = useState<Theme>(value || (colorScheme as Theme) || "light")

  useEffect(() => {
    // Load saved theme from storage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme")
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.error("Failed to load theme:", error)
      }
    }

    loadTheme()
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    // Save theme to storage
    AsyncStorage.setItem("theme", newTheme).catch((error) => {
      console.error("Failed to save theme:", error)
    })
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export { ThemeProvider }

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
