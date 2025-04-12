"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native"
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

        // Calculate device heading
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

  // Calculate the rotation for the compass and qibla indicator
  const compassRotation = heading
  const qiblaRotation = qiblaAngle !== null ? qiblaAngle - compassRotation : 0

  if (!location || qiblaAngle === null) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={isDark ? "#8BC34A" : "#4CAF50"} />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Determining your location...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.compassContainer}>
        <View style={styles.compassInnerContainer}>
          {/* Compass Rose */}
          <Image
            source={require("@/assets/images/qibla.png")}
            style={[styles.compassRose, { transform: [{ rotate: `${-compassRotation}deg` }] }]}
          />

          {/* Qibla Direction Indicator */}
          <View style={[styles.qiblaIndicator, { transform: [{ rotate: `${qiblaRotation}deg` }] }]}>
            <View style={styles.qiblaArrow} />
          </View>

          {/* Center Dot */}
          <View style={styles.centerDot} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, isDark && styles.textDark]}>Qibla Direction</Text>
        <Text style={[styles.infoText, isDark && styles.textDark]}>
          The Kaaba is {qiblaAngle.toFixed(1)}° from North
        </Text>
        <Text style={[styles.infoSubtext, isDark && styles.subtextDark]}>
          Hold your phone flat and align the green arrow with the Qibla direction
        </Text>
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
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  loadingContainer: {
    justifyContent: "center",
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
  subtextDark: {
    color: "#A0A0A0",
  },
  compassContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
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
    backgroundColor: "#4CAF50",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    position: "absolute",
  },
  infoContainer: {
    alignItems: "center",
    padding: 20,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 18,
    color: "#333333",
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
})
