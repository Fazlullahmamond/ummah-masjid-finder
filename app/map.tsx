"use client"

import { useEffect, useState } from "react"
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  Pressable,
  Platform,
  Linking,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import { useFavorites } from "./context/favorites-context"
import masjidService from "./services/masjid-service"
import { fetchPrayerTimes } from "./services/prayer-service"
import type { Masjid } from "./types"
import * as Location from "expo-location"
import { SafeAreaView } from "react-native-safe-area-context"

// Create a fallback component for when maps aren't available
function MasjidListView({
  masjids,
  isLoading,
  mapError,
  isDark,
  onOpenInMaps,
  onToggleFavorite,
  isFavorite,
  onViewPrayerTimes,
  onRefresh,
}: {
  masjids: Masjid[]
  isLoading: boolean
  mapError: string | null
  isDark: boolean
  onOpenInMaps: (masjid: Masjid) => void
  onToggleFavorite: (masjid: Masjid) => void
  isFavorite: (id: string) => boolean
  onViewPrayerTimes: (masjid: Masjid) => void
  onRefresh: () => void
}) {
  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>Finding nearby masjids...</Text>
        </View>
      ) : mapError ? (
        <View style={styles.errorMessageContainer}>
          <Text style={[styles.errorMessageText, isDark && styles.textDark]}>{mapError}</Text>
        </View>
      ) : masjids.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location" size={60} color={isDark ? "#8BC34A" : "#4CAF50"} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, isDark && styles.titleDark]}>No Masjids Found</Text>
          <Text style={[styles.emptyMessage, isDark && styles.subtitleDark]}>
            Try a different location or increase search radius
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {masjids.map((masjid) => (
            <View key={masjid.id} style={[styles.masjidCard, isDark && styles.masjidCardDark]}>
              <View style={styles.masjidHeader}>
                <Text style={[styles.masjidName, isDark && styles.textDark]}>{masjid.name}</Text>
                <Pressable
                  style={({ pressed }) => [styles.favoriteButton, pressed && { opacity: 0.7 }]}
                  onPress={() => onToggleFavorite(masjid)}
                >
                  <Ionicons
                    name={isFavorite(masjid.id) ? "heart" : "heart-outline"}
                    size={24}
                    color={isDark ? "#8BC34A" : "#4CAF50"}
                  />
                </Pressable>
              </View>
              <Text style={[styles.masjidAddress, isDark && styles.subtitleDark]}>{masjid.address}</Text>
              {masjid.distance && (
                <Text style={[styles.masjidDistance, isDark && styles.subtitleDark]}>
                  {masjid.distance.toFixed(2)} km away
                </Text>
              )}
              <View style={styles.masjidActions}>
                <Pressable
                  style={[styles.masjidActionButton, isDark && styles.masjidActionButtonDark]}
                  onPress={() => onOpenInMaps(masjid)}
                >
                  <Ionicons name="navigate" size={18} color={isDark ? "#8BC34A" : "#4CAF50"} />
                  <Text style={[styles.masjidActionText, isDark && styles.masjidActionTextDark]}>Directions</Text>
                </Pressable>
                <Pressable
                  style={[styles.masjidActionButton, isDark && styles.masjidActionButtonDark]}
                  onPress={() => onViewPrayerTimes(masjid)}
                >
                  <Ionicons name="time" size={18} color={isDark ? "#8BC34A" : "#4CAF50"} />
                  <Text style={[styles.masjidActionText, isDark && styles.masjidActionTextDark]}>Prayer Times</Text>
                </Pressable>
              </View>
            </View>
            ))}
          </ScrollView>
          )}

      <View style={styles.bottomActionBar}>
        <Pressable
          style={[styles.bottomActionButton, isDark && styles.bottomActionButtonDark]}
          onPress={() => onRefresh()}
        >
          <Ionicons name="refresh" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
          <Text style={[styles.bottomActionText, isDark && styles.bottomActionTextDark]}>Refresh</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default function MapScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { location, locationPermissionStatus, requestLocationPermission, isManualLocation } = useLocation()
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()

  const [masjids, setMasjids] = useState<Masjid[]>([])
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)

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
      const nearbyMasjids = await masjidService.fetchNearbyMasjids(location.latitude, location.longitude, 5)
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

  const handleViewPrayerTimes = async (masjid: Masjid) => {
    setSelectedMasjid(masjid)

    try {
      const times = await fetchPrayerTimes(masjid.latitude, masjid.longitude)

      // Show prayer times in an alert
      Alert.alert(
        `Prayer Times for ${masjid.name}`,
        `Fajr: ${times.fajr}\nSunrise: ${times.sunrise}\nDhuhr: ${times.dhuhr}\nAsr: ${times.asr}\nMaghrib: ${times.maghrib}\nIsha: ${times.isha}`,
        [{ text: "OK" }],
      )
    } catch (error) {
      console.error("Failed to fetch prayer times:", error)
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

  // Always use the list view since maps are not working
  return (
    <MasjidListView
      masjids={masjids}
      isLoading={isLoading}
      mapError={mapError}
      isDark={isDark}
      onOpenInMaps={handleOpenInMaps}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
      onViewPrayerTimes={handleViewPrayerTimes}
      onRefresh={loadNearbyMasjids}
    />
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
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  titleDark: {
    color: "#E0E0E0",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  subtitleDark: {
    color: "#A0A0A0",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
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
    alignSelf: "center",
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
  errorMessageContainer: {
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    margin: 16,
  },
  errorMessageText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  masjidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  masjidCardDark: {
    backgroundColor: "#1E1E1E",
  },
  masjidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  masjidName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  masjidAddress: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  masjidDistance: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 16,
  },
  masjidActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  masjidActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F8E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  masjidActionButtonDark: {
    backgroundColor: "#2D3B21",
  },
  masjidActionText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 6,
  },
  masjidActionTextDark: {
    color: "#8BC34A",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  bottomActionBar: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  bottomActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bottomActionButtonDark: {
    backgroundColor: "#2D3B21",
  },
  bottomActionText: {
    fontSize: 16,
    color: "#4CAF50",
    marginLeft: 8,
  },
  bottomActionTextDark: {
    color: "#8BC34A",
  },
})
