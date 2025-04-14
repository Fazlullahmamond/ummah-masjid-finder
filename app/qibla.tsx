"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Appearance,
} from "react-native"
import { Magnetometer } from "expo-sensors"
import { useTheme } from "./components/theme-provider"
import { useLocation } from "./context/location-context"
import { calculateQiblaDirection } from "./utils/qibla-utils"

export default function QiblaScreen() {
  const { theme } = useTheme()
  const { location } = useLocation()

  const [subscription, setSubscription] = useState<any>(null)
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 })
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null)
  const [heading, setHeading] = useState(0)

  const isDark = theme === "dark"

  useEffect(() => {
    if (location) {
      const angle = calculateQiblaDirection(location.latitude, location.longitude)
      setQiblaAngle(angle)
    }

    _subscribe()

    return () => {
      _unsubscribe()
    }
  }, [location])

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener((data) => {
        setMagnetometerData(data)

        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI)
        const heading = (angle + 360) % 360
        setHeading(heading)
      }),
    )

    Magnetometer.setUpdateInterval(100)
  }

  const _unsubscribe = () => {
    subscription && subscription.remove()
    setSubscription(null)
  }

  const compassRotation = heading
  const qiblaRotation =
    qiblaAngle !== null ? ((qiblaAngle - heading + 360) % 360) : 0

  const themeColors = isDark ? colors.dark : colors.light

  if (!location || qiblaAngle === null) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Determining your location...
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.compassContainer}>
        <View style={[styles.compassInnerContainer, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
          <Image
            source={require("@/assets/images/qibla.png")}
            style={[
              styles.compassRose,
              { transform: [{ rotate: `${-compassRotation}deg` }] },
            ]}
          />
          <View
            style={[
              styles.qiblaIndicator,
              { transform: [{ rotate: `${qiblaRotation}deg` }] },
            ]}
          >
            <View style={[styles.qiblaArrow, { backgroundColor: themeColors.accent, shadowColor: themeColors.accent }]} />
          </View>
          <View style={[styles.centerDot, { backgroundColor: themeColors.accent, borderColor: themeColors.border }]} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: themeColors.text }]}>Qibla Direction</Text>
        <Text style={[styles.infoText, { color: themeColors.text }]}>
          The Kaaba is {qiblaAngle.toFixed(1)}° from North
        </Text>
        <Text style={[styles.infoSubtext, { color: themeColors.secondary }]}>
          Hold your phone flat and align the green arrow with the Qibla direction
        </Text>

        {/* Debug Info (optional) */}
        {/* <Text style={{ color: themeColors.secondary, marginTop: 10 }}>Heading: {heading.toFixed(1)}°</Text>
        <Text style={{ color: themeColors.secondary }}>Qibla: {qiblaAngle.toFixed(1)}°</Text>
        <Text style={{ color: themeColors.secondary }}>Arrow Rot: {qiblaRotation.toFixed(1)}°</Text> */}
      </View>
    </View>
  )
}

// Color palette
const colors = {
  light: {
    background: "#F5F5F5",
    text: "#222",
    secondary: "#666",
    accent: "#4CAF50",
    border: "#DDD",
  },
  dark: {
    background: "#121212",
    text: "#E0E0E0",
    secondary: "#A0A0A0",
    accent: "#8BC34A",
    border: "#333",
  },
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  compassContainer: {
    width: 320,
    height: 320,
    borderRadius: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  compassInnerContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  compassRose: {
    width: 280,
    height: 280,
    position: "absolute",
    opacity: 0.9,
  },
  qiblaIndicator: {
    position: "absolute",
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  qiblaArrow: {
    width: 10,
    height: 140,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
    borderWidth: 2,
  },
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
})
