"use client"
import { View, Text, StyleSheet, Switch, Pressable, Alert, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import { useFavorites } from "./context/favorites-context"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { requestLocationPermission } = useLocation()
  const { clearFavorites } = useFavorites()

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const handleClearFavorites = () => {
    Alert.alert("Clear Favorites", "Are you sure you want to remove all favorites? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => {
          clearFavorites()
          Alert.alert("Success", "All favorites have been cleared.")
        },
      },
    ])
  }

  const handleClearCache = async () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear the app cache? This will remove all temporary data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Cache",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all cache except favorites and theme preference
            const keys = await AsyncStorage.getAllKeys()
            const keysToRemove = keys.filter((key) => !key.includes("favorites") && !key.includes("theme"))
            await AsyncStorage.multiRemove(keysToRemove)
            Alert.alert("Success", "Cache cleared successfully.")
          } catch (error) {
            console.error("Failed to clear cache:", error)
            Alert.alert("Error", "Failed to clear cache. Please try again.")
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Appearance</Text>
        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
          <View style={styles.settingContent}>
            <Ionicons name="moon" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.settingText, isDark && styles.textDark]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#D1D1D1", true: "#689F38" }}
            thumbColor={isDark ? "#8BC34A" : "#F5F5F5"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Location</Text>
        <Pressable
          style={[styles.settingItem, isDark && styles.settingItemDark]}
          onPress={() => {
        Alert.alert(
          "Location Permission",
          "This will request location permissions for the app. Do you want to proceed?",
          [
            { text: "Cancel", style: "cancel" },
            {
          text: "Proceed",
          onPress: requestLocationPermission,
            },
          ]
        )
          }}
        >
          <View style={styles.settingContent}>
        <Ionicons name="location" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
        <Text style={[styles.settingText, isDark && styles.textDark]}>Update Location Permissions</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#A0A0A0" : "#757575"} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Data Management</Text>
        <Pressable style={[styles.settingItem, isDark && styles.settingItemDark]} onPress={handleClearFavorites}>
          <View style={styles.settingContent}>
            <Ionicons name="heart-dislike" size={24} color={isDark ? "#E57373" : "#F44336"} />
            <Text style={[styles.settingText, isDark && styles.textDark]}>Clear All Favorites</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#A0A0A0" : "#757575"} />
        </Pressable>

        <Pressable style={[styles.settingItem, isDark && styles.settingItemDark]} onPress={handleClearCache}>
          <View style={styles.settingContent}>
            <Ionicons name="trash" size={24} color={isDark ? "#E57373" : "#F44336"} />
            <Text style={[styles.settingText, isDark && styles.textDark]}>Clear Cache</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#A0A0A0" : "#757575"} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>About</Text>
        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
          <View style={styles.settingContent}>
            <Ionicons name="information-circle" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
            <Text style={[styles.settingText, isDark && styles.textDark]}>Version</Text>
          </View>
          <Text style={[styles.versionText, isDark && styles.versionTextDark]}>1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingItemDark: {
    backgroundColor: "#1E1E1E",
    borderBottomColor: "#2C2C2C",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
  textDark: {
    color: "#E0E0E0",
  },
  versionText: {
    fontSize: 16,
    color: "#757575",
  },
  versionTextDark: {
    color: "#A0A0A0",
  },
})
