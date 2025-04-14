"use client"
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Linking, Platform } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./components/theme-provider"
import { useFavorites } from "./context/favorites-context"
import { useLocation } from "./context/location-context"
import type { Masjid } from "./types"
import EmptyState from "./components/empty-state"
import { SafeAreaView } from "react-native-safe-area-context"

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

    const origin = `${location.latitude},${location.longitude}`
    const destination = `${masjid.latitude},${masjid.longitude}`

    let url = ""
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
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
    <SafeAreaView style={[styles.card, styles.cardContent, isDark && styles.cardDark]}>
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
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <EmptyState
          icon="heart"
          title="No Favorites Yet"
          message="Save your favorite masjids for quick access"
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  containerDark: {
    backgroundColor: "#121212",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  cardDark: {
    backgroundColor: "#1E1E1E",
  },
  cardContent: {
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  cardAddress: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 12,
  },
  textDark: {
    color: "#E0E0E0",
  },
  removeButton: {
    padding: 8,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 6,
    justifyContent: "center",
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: "#2D3B21",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#4CAF50",
    fontWeight: "500",
  },
  actionButtonTextDark: {
    color: "#8BC34A",
  },
})
