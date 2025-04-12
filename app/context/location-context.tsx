"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Alert, Platform, Linking } from "react-native"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface LocationContextType {
  location: { latitude: number; longitude: number } | null
  locationPermissionStatus: Location.PermissionStatus
  requestLocationPermission: () => Promise<void>
  setManualLocation: (location: { latitude: number; longitude: number }) => void
  isManualLocation: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus>(
    Location.PermissionStatus.UNDETERMINED,
  )
  const [isManualLocation, setIsManualLocation] = useState(false)

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setLocationPermissionStatus(status)

      if (status === Location.PermissionStatus.GRANTED) {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }

        setLocation(locationData)
        setIsManualLocation(false)

        // Save location to AsyncStorage for offline use
        await AsyncStorage.setItem("lastKnownLocation", JSON.stringify(locationData))
      } else {
        Alert.alert(
          "Location Permission Required",
          "This app needs access to your location to find nearby masjids. You can either grant permission or enter your location manually.",
          [
            { text: "Enter Manually", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:")
                } else {
                  Linking.openSettings()
                }
              },
            },
          ],
        )

        // Try to load last known location if permission is denied
        const lastKnownLocation = await AsyncStorage.getItem("lastKnownLocation")
        if (lastKnownLocation) {
          setLocation(JSON.parse(lastKnownLocation))
        }
      }
    } catch (error) {
      console.error("Error requesting location permission:", error)
      Alert.alert("Error", "Failed to get location. Please try again later or enter your location manually.")
    }
  }, [])

  const setManualLocation = useCallback((manualLocation: { latitude: number; longitude: number }) => {
    setLocation(manualLocation)
    setIsManualLocation(true)

    // Save manual location to AsyncStorage
    AsyncStorage.setItem("lastKnownLocation", JSON.stringify(manualLocation)).catch((error) => {
      console.error("Failed to save manual location:", error)
    })
  }, [])

  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync()
        setLocationPermissionStatus(status)

        if (status === Location.PermissionStatus.GRANTED) {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })

          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          })
          setIsManualLocation(false)
        } else {
          // Try to load last known location if permission is not granted
          const lastKnownLocation = await AsyncStorage.getItem("lastKnownLocation")
          if (lastKnownLocation) {
            setLocation(JSON.parse(lastKnownLocation))
            setIsManualLocation(true)
          }
        }
      } catch (error) {
        console.error("Error checking location permission:", error)
      }
    }

    checkPermissionAndGetLocation()
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        locationPermissionStatus,
        requestLocationPermission,
        setManualLocation,
        isManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
