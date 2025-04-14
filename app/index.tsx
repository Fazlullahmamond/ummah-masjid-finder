"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import * as Location from "expo-location"
import { SafeAreaView } from "react-native-safe-area-context"

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
        router.push("/map")
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
    <ScrollView style={styles.formContainer}>
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
    </ScrollView>
  )

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
      <Text style={[styles.loadingText, isDark && styles.textDark]}>Getting your location...</Text>
    </View>
  )

  
  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >

      <SafeAreaView style={styles.iconContainer}>
        <View style={[styles.iconBackground, isDark && styles.iconBackgroundDark]}>
          <Ionicons name="home" size={80} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </View>
      </SafeAreaView>

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

      <View style={styles.featureGrid}>
        <Pressable style={[styles.featureCard, isDark && styles.featureCardDark]} onPress={() => router.push("/map")}>
          <View style={[styles.featureIconContainer, isDark && styles.featureIconContainerDark]}>
            <Ionicons name="map" size={32} color={isDark ? "#8BC34A" : "#4CAF50"} />
          </View>
          <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>Find Masjids</Text>
          <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
            Discover nearby masjids on the map
          </Text>
        </Pressable>

        <Pressable style={[styles.featureCard, isDark && styles.featureCardDark]} onPress={() => router.push("/qibla")}>
          <View style={[styles.featureIconContainer, isDark && styles.featureIconContainerDark]}>
            <Ionicons name="compass" size={32} color={isDark ? "#8BC34A" : "#4CAF50"} />
          </View>
          <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>Qibla Direction</Text>
          <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
            Find the direction to pray
          </Text>
        </Pressable>

        <Pressable
          style={[styles.featureCard, isDark && styles.featureCardDark]}
          onPress={() => router.push("/favorites")}
        >
          <View style={[styles.featureIconContainer, isDark && styles.featureIconContainerDark]}>
            <Ionicons name="heart" size={32} color={isDark ? "#8BC34A" : "#4CAF50"} />
          </View>
          <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>Favorites</Text>
          <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
            Access your saved masjids
          </Text>
        </Pressable>

        <Pressable
          style={[styles.featureCard, isDark && styles.featureCardDark]}
          onPress={() => router.push("/settings")}
        >
          <View style={[styles.featureIconContainer, isDark && styles.featureIconContainerDark]}>
            <Ionicons name="settings" size={32} color={isDark ? "#8BC34A" : "#4CAF50"} />
          </View>
          <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>Settings</Text>
          <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
            Customize app preferences
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
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
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#F9FBF7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureCardDark: {
    backgroundColor: "#1A2613",
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F8E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIconContainerDark: {
    backgroundColor: "#2D3B21",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 6,
    textAlign: "center",
  },
  featureTitleDark: {
    color: "#E0E0E0",
  },
  featureDescription: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  featureDescriptionDark: {
    color: "#A0A0A0",
  },
})
