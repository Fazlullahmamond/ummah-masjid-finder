"use client"
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Linking, Platform } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useFavorites } from "./context/favorites-context"
import { useLocation } from "./context/location-context"
import type { Masjid } from "./types"
import EmptyState from "./components/empty-state"

export default function FavoritesScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { favorites, removeFavorite } = useFavorites()
  const { location } = useLocation()

  const isDark = theme === "dark"

  const handleRemoveFavorite = (id: string) => {
    Alert.alert("Remove Favorite", "Are you sure you want to remove this masjid from your favorites?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFavorite(id) },
    ])
  }

  const handleGetDirections = (masjid: Masjid) => {
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

  const renderItem = ({ item }: { item: Masjid }) => (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>{item.name}</Text>
          <Pressable
            onPress={() => handleRemoveFavorite(item.id)}
            style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="close-circle" size={24} color={isDark ? "#E57373" : "#F44336"} />
          </Pressable>
        </View>
        <Text style={[styles.cardAddress, isDark && styles.textDark]}>{item.address}</Text>
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={() => {
              // Navigate to map and focus on this masjid
              router.push({
                pathname: "/map",
                params: { masjidId: item.id },
              })
            }}
          >
            <Ionicons name="map" size={18} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.actionButtonText, isDark && styles.actionButtonTextDark]}>View on Map</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={() => handleGetDirections(item)}
          >
            <Ionicons name="navigate" size={18} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.actionButtonText, isDark && styles.actionButtonTextDark]}>Directions</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          icon="heart"
          title="No Favorites Yet"
          message="Save your favorite masjids for quick access"
          isDark={isDark}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardDark: {
    backgroundColor: "#1E1E1E",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  cardAddress: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  textDark: {
    color: "#E0E0E0",
  },
  removeButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionButtonDark: {
    backgroundColor: "#2D3B21",
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  actionButtonTextDark: {
    color: "#8BC34A",
  },
})
