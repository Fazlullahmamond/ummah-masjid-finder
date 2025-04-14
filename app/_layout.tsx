import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useColorScheme } from "react-native"
import { ThemeProvider } from "./components/theme-provider"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { LocationProvider } from "./context/location-context"
import { FavoritesProvider } from "./context/favorites-context"

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? "dark" : "light"}>
        <LocationProvider>
          <FavoritesProvider>
            <Stack
              screenOptions={{
                headerShown: false, // Hides the header
                contentStyle: {
                  backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF",
                },
              }}
            >
              <Stack.Screen name="index" options={{ title: "Masjid Finder" }} />
              <Stack.Screen name="map" options={{ title: "Map View" }} />
              <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
              <Stack.Screen name="qibla" options={{ title: "Qibla Direction" }} />
              <Stack.Screen name="settings" options={{ title: "Settings" }} />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </FavoritesProvider>
        </LocationProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
