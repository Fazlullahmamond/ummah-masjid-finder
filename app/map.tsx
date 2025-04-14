"use client"

import { useEffect, useState, useRef } from "react"
import { View, StyleSheet, Alert, ActivityIndicator, Text, Pressable, Platform, Linking } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import { useFavorites } from "./context/favorites-context"
import { fetchNearbyMasjids } from "./services/masjid-service"
import { fetchPrayerTimes } from "./services/prayer-service"
import type { Masjid } from "./types"
import MasjidBottomSheet from "./components/masjid-bottom-sheet"
import { darkMapStyle } from "./constants/map-styles"
import * as Location from "expo-location"

// Import MapView directly - don't use conditional imports as they can cause issues
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import type { BottomSheetModal } from "@gorhom/bottom-sheet"

export default function MapScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { location, locationPermissionStatus, requestLocationPermission, isManualLocation } = useLocation()
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()

  const [masjids, setMasjids] = useState<Masjid[]>([])
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null)
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const mapRef = useRef<MapView>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const snapPoints = ["25%", "50%", "75%"]
  const isDark = theme === "dark"

  useEffect(() => {
    if (location) {
      loadNearbyMasjids()
    }
  }, [location])

  const loadNearbyMasjids = async () => {
    if (!location) return

    setIsLoading(true)
    setMapError(null)

    try {
      const nearbyMasjids = await fetchNearbyMasjids(location.latitude, location.longitude, 5)
      setMasjids(nearbyMasjids)

      if (nearbyMasjids.length === 0) {
        setMapError("No masjids found nearby. Try a different location or increase search radius.")
      }
    } catch (error) {
      console.error("Error loading masjids:", error)
      setMapError("Failed to load nearby masjids. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkerPress = async (masjid: Masjid) => {
    setSelectedMasjid(masjid)

    try {
      const times = await fetchPrayerTimes(masjid.latitude, masjid.longitude)
      setPrayerTimes(times)

      if (bottomSheetModalRef.current) {
        bottomSheetModalRef.current.present()
      }
    } catch (error) {
      console.error("Failed to fetch prayer times:", error)
      setPrayerTimes(null)
      Alert.alert("Error", "Failed to load prayer times. Please try again.")
    }
  }

  const handleOpenInMaps = (masjid: Masjid) => {
    if (!location) {
      Alert.alert("Error", "Your location is not available. Please try again.")
      return
    }

    // Get origin coordinates (user's location)
    const origin = `${location.latitude},${location.longitude}`

    // Get destination coordinates (masjid location)
    const destination = `${masjid.latitude},${masjid.longitude}`

    // Create the appropriate URL based on the platform
    let url = ""

    if (Platform.OS === "ios") {
      // Apple Maps URL format
      url = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`

      // Alternative: Use Google Maps if installed (iOS)
      // url = `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`
    } else {
      // Google Maps URL format for Android
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
    }

    // Check if the URL can be opened
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          // Fallback for when specific map apps are not installed
          const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
          return Linking.openURL(fallbackUrl)
        }
      })
      .catch((err) => {
        console.error("An error occurred while opening maps:", err)
        Alert.alert("Error", "Could not open maps application. Please try again.")
      })
  }

  const handleToggleFavorite = (masjid: Masjid) => {
    if (isFavorite(masjid.id)) {
      removeFavorite(masjid.id)
    } else {
      addFavorite(masjid)
    }
  }

  const handleMapReady = () => {
    setMapReady(true)
    console.log("Map is ready!")
  }

  // If we're still loading or don't have location, show loading state
  if (isLoading && !masjids.length) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>
          {!location ? "Getting your location..." : "Finding nearby masjids..."}
        </Text>
      </View>
    )
  }

  // If location permission is not granted, show permission request
  if (locationPermissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Location Permission Required</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Please allow location access so we can find nearby masjids for you.
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
    )
  }

  // Render the map with masjids
  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={!isManualLocation}
          showsMyLocationButton={!isManualLocation}
          showsCompass
          customMapStyle={isDark ? darkMapStyle : []}
          onMapReady={handleMapReady}
        >
          {isManualLocation && location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="#4285F4"
            />
          )}

          {masjids.map((masjid) => (
            <Marker
              key={masjid.id}
              coordinate={{
                latitude: masjid.latitude,
                longitude: masjid.longitude,
              }}
              title={masjid.name}
              description={masjid.address}
              onPress={() => handleMarkerPress(masjid)}
            >
              <View style={[styles.markerContainer, isDark && styles.markerContainerDark]}>
                <Ionicons name="home" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={[styles.errorContainer, { top: 100 }]}>
          <Text style={styles.errorText}>Location not available. Please try again.</Text>
        </View>
      )}

      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push("/favorites")}
        >
          <Ionicons name="heart" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </Pressable>

        <Pressable
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push("/qibla")}
        >
          <Ionicons name="compass" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </Pressable>

        <Pressable
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </Pressable>

        <Pressable style={[styles.actionButton, isDark && styles.actionButtonDark]} onPress={loadNearbyMasjids}>
          <Ionicons name="refresh" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
        </Pressable>
      </View>

      {mapError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{mapError}</Text>
        </View>
      )}

      {!mapReady && location && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading map...</Text>
        </View>
      )}

      <MasjidBottomSheet
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        masjid={selectedMasjid}
        isFavorite={selectedMasjid ? isFavorite(selectedMasjid.id) : false}
        onOpenInMaps={handleOpenInMaps}
        onToggleFavorite={handleToggleFavorite}
        isDark={isDark}
        prayerTimes={prayerTimes}
      />
    </View>
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
  map: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    marginTop: 20,
    marginHorizontal: 20,
  },
  titleDark: {
    color: "#E0E0E0",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
    marginHorizontal: 20,
    textAlign: "center",
  },
  subtitleDark: {
    color: "#A0A0A0",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333333",
  },
  textDark: {
    color: "#E0E0E0",
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
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
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    padding: 8,
  },
  errorContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  markerContainerDark: {
    backgroundColor: "#333333",
    borderColor: "#8BC34A",
  },
  actionButtonsContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 8,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: "rgba(30, 30, 30, 0.9)",
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
})
