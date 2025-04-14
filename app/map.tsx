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
import type { BottomSheetModal as BottomSheetModalType } from "@gorhom/bottom-sheet"
import { ScrollView } from "react-native-gesture-handler"

// We'll conditionally import MapView to avoid the native module error
let MapView: any = null
let Marker: any = null
let PROVIDER_GOOGLE: any = null
let BottomSheetModal: any = null

try {
  // Only import if we're in a native environment
  const Maps = require("react-native-maps")
  MapView = Maps.default
  Marker = Maps.Marker
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE

  const BottomSheet = require("@gorhom/bottom-sheet")
  BottomSheetModal = BottomSheet.BottomSheetModal
} catch (error) {
  console.log("Maps or BottomSheet module not available")
}

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

  const mapRef = useRef(null)
  
  const bottomSheetModalRef = useRef<BottomSheetModalType | null>(null)

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
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" })
    const latLng = `${masjid.latitude},${masjid.longitude}`
    const label = masjid.name
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    })

    if (url) {
      Linking.openURL(url)
    }
  }

  const handleToggleFavorite = (masjid: Masjid) => {
    if (isFavorite(masjid.id)) {
      removeFavorite(masjid.id)
    } else {
      addFavorite(masjid)
    }
  }

  // If MapView is not available, show a fallback UI
  if (!MapView || !BottomSheetModal) {
    return (
      <ScrollView style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Map Not Available</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          The map functionality requires a native device. Please run this app on a physical device or emulator.
        </Text>

        <View style={styles.masjidList}>
          <Text style={[styles.listTitle, isDark && styles.titleDark]}>
            {isLoading ? "Finding Nearby Masjids..." : "Nearby Masjids"}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} style={styles.loader} />
          ) : mapError ? (
            <Text style={styles.errorText}>{mapError}</Text>
          ) : masjids.length > 0 ? (
            masjids.map((masjid) => (
              <View key={masjid.id} style={[styles.masjidItem, isDark && styles.masjidItemDark]}>
                <View>
                  <Text style={[styles.masjidName, isDark && styles.textDark]}>{masjid.name}</Text>
                  <Text style={[styles.masjidAddress, isDark && styles.subtitleDark]}>{masjid.address}</Text>
                  {masjid.distance && (
                    <Text style={[styles.masjidDistance, isDark && styles.subtitleDark]}>
                      {masjid.distance.toFixed(2)} km away
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={isFavorite(masjid.id) ? "heart" : "heart-outline"}
                  size={24}
                  color={isDark ? "#8BC34A" : "#4CAF50"}
                  onPress={() => {
                    if (isFavorite(masjid.id)) {
                      removeFavorite(masjid.id)
                    } else {
                      addFavorite(masjid)
                    }
                  }}
                />
              </View>
            ))
          ) : (
            <Text style={[styles.noMasjidsText, isDark && styles.textDark]}>
              No masjids found nearby. Try a different location.
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, isDark && styles.buttonDark]} onPress={() => router.push("/favorites")}>
            <Ionicons name="heart" size={20} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>Favorites</Text>
          </Pressable>

          <Pressable style={[styles.button, isDark && styles.buttonDark]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>Back</Text>
          </Pressable>

          <Pressable style={[styles.button, isDark && styles.buttonDark]} onPress={loadNearbyMasjids}>
            <Ionicons name="refresh" size={20} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>Refresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    )
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

  // Render the map with masjids
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={!isManualLocation}
        showsMyLocationButton={!isManualLocation}
        showsCompass
        customMapStyle={isDark ? darkMapStyle : []}
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
  button: {
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  buttonDark: {
    backgroundColor: "#2D3B21",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
    marginLeft: 6,
  },
  buttonTextDark: {
    color: "#8BC34A",
  },
  masjidList: {
    flex: 1,
    width: "100%",
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  masjidItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FBF7",
    borderRadius: 8,
    marginBottom: 8,
  },
  masjidItemDark: {
    backgroundColor: "#1A2613",
  },
  masjidName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  masjidAddress: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  masjidDistance: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  noMasjidsText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    position: 'relative',
    bottom: 10,
    right: 0,
    borderTopColor: "#EEEEEE",
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  errorContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    padding: 12,
    borderRadius: 8,
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
})
