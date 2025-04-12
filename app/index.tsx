"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import * as Location from "expo-location"


export type LocationContextType = {
    location: { latitude: number; longitude: number } | null;
    locationPermissionStatus: "granted" | "denied" | "undetermined";
    requestLocationPermission: () => void;
    setManualLocation: (location: { latitude: number; longitude: number }) => void;
  };


export default function Index() {
  const { theme } = useTheme()
  const router = useRouter()
  const { location, locationPermissionStatus, requestLocationPermission, setManualLocation } = useLocation()

  const [address, setAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const isDark = theme === "dark"

  useEffect(() => {
    // Request location permission when component mounts
    if (locationPermissionStatus === "undetermined") {
      requestLocationPermission()
    }
  }, [locationPermissionStatus, requestLocationPermission])

  useEffect(() => {
    // Navigate to map when location is available
    if (location) {
      router.push("/map")
    }
  }, [location, router])

  const handleManualLocationSearch = async () => {
    if (!address.trim()) {
      setLocationError("Please enter an address")
      return
    }

    setIsSearching(true)
    setLocationError(null)

    try {
      const geocodedLocations = await Location.geocodeAsync(address)

      if (geocodedLocations.length > 0) {
        const { latitude, longitude } = geocodedLocations[0]
        setManualLocation({ latitude, longitude })
      } else {
        setLocationError("Could not find this location. Please try a different address.")
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      setLocationError("Error finding location. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const renderPermissionDenied = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.formTitle, isDark && styles.titleDark]}>Enter Your Location</Text>
      <Text style={[styles.formSubtitle, isDark && styles.subtitleDark]}>
        Please enter your address or city to find nearby masjids
      </Text>

      <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
        <Ionicons name="location" size={20} color={isDark ? "#8BC34A" : "#4CAF50"} />
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Enter address or city"
          placeholderTextColor={isDark ? "#888888" : "#999999"}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {locationError && <Text style={styles.errorText}>{locationError}</Text>}

      <Pressable
        style={[styles.searchButton, isDark && styles.searchButtonDark]}
        onPress={handleManualLocationSearch}
        disabled={isSearching}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color={isDark ? "#121212" : "#FFFFFF"} />
        ) : (
          <Text style={[styles.searchButtonText, isDark && styles.searchButtonTextDark]}>Find Nearby Masjids</Text>
        )}
      </Pressable>

      <Pressable style={styles.retryButton} onPress={requestLocationPermission}>
        <Text style={[styles.retryButtonText, isDark && styles.retryButtonTextDark]}>
          Try using device location again
        </Text>
      </Pressable>
    </View>
  )

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
      <Text style={[styles.loadingText, isDark && styles.textDark]}>Getting your location...</Text>
    </View>
  )

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, isDark && styles.iconBackgroundDark]}>
          <Ionicons name="home" size={80} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </View>
      </View>

      <Text style={[styles.title, isDark && styles.titleDark]}>Masjid Finder</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Find nearby masjids and prayer times</Text>

      {locationPermissionStatus === "denied" ? (
        renderPermissionDenied()
      ) : locationPermissionStatus === "granted" && !location ? (
        renderLoading()
      ) : locationPermissionStatus === "undetermined" ? (
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, isDark && styles.textDark]}>
            Please allow location access to find nearby masjids
          </Text>
          <Pressable
            style={[styles.permissionButton, isDark && styles.permissionButtonDark]}
            onPress={requestLocationPermission}
          >
            <Text style={[styles.permissionButtonText, isDark && styles.permissionButtonTextDark]}>
              Grant Location Permission
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.buttonContainer}>
        <Pressable style={[styles.navButton, isDark && styles.navButtonDark]} onPress={() => router.push("/favorites")}>
          <Ionicons name="heart" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.navButtonText, isDark && styles.navButtonTextDark]}>Favorites</Text>
        </Pressable>

        <Pressable style={[styles.navButton, isDark && styles.navButtonDark]} onPress={() => router.push("/qibla")}>
          <Ionicons name="compass" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.navButtonText, isDark && styles.navButtonTextDark]}>Qibla</Text>
        </Pressable>

        <Pressable style={[styles.navButton, isDark && styles.navButtonDark]} onPress={() => router.push("/settings")}>
          <Ionicons name="settings" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.navButtonText, isDark && styles.navButtonTextDark]}>Settings</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F1F8E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconBackgroundDark: {
    backgroundColor: "#2D3B21",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  titleDark: {
    color: "#E0E0E0",
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 40,
    textAlign: "center",
  },
  subtitleDark: {
    color: "#A0A0A0",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333333",
  },
  textDark: {
    color: "#E0E0E0",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: "#F1F8E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "30%",
  },
  navButtonDark: {
    backgroundColor: "#2D3B21",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
    marginTop: 8,
  },
  navButtonTextDark: {
    color: "#8BC34A",
  },
  permissionContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  permissionText: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonDark: {
    backgroundColor: "#8BC34A",
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  permissionButtonTextDark: {
    color: "#121212",
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputContainerDark: {
    backgroundColor: "#2A2A2A",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333333",
    marginLeft: 8,
  },
  inputDark: {
    color: "#E0E0E0",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchButtonDark: {
    backgroundColor: "#8BC34A",
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  searchButtonTextDark: {
    color: "#121212",
  },
  retryButton: {
    alignItems: "center",
    padding: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    textDecorationLine: "underline",
  },
  retryButtonTextDark: {
    color: "#8BC34A",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginBottom: 16,
  },
})
