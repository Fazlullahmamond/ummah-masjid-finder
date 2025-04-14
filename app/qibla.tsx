"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Image, Pressable } from "react-native"
import * as Location from "expo-location"
import { Magnetometer } from "expo-sensors"
import { useTheme } from "./components/theme-provider"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#333333",
  },
  textDark: {
    color: "#E0E0E0",
  },
  subtextDark: {
    color: "#A0A0A0",
  },
  errorText: {
    color: "#F44336",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  direction: {
    alignItems: "center",
    marginBottom: 20,
  },
  directionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  directionDegree: {
    fontSize: 20,
    color: "#333333",
    marginTop: 5,
  },
  compassContainer: {
    width: 300,
    height: 300,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  compassImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    position: "absolute",
  },
  kaabaContainer: {
    width: 300,
    height: 300,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  kaabaImage: {
    width: 40,
    height: 100,
    resizeMode: "contain",
  },
  qiblaInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  qiblaInfoContainerDark: {
    backgroundColor: "#1A2613",
  },
  qiblaInfoIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  qiblaInfoText: {
    fontSize: 18,
    color: "#333333",
  },
  instructionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
})

export default function QiblaScreen() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [subscription, setSubscription] = useState<any>(null)
  const [magnetometer, setMagnetometer] = useState(0)
  const [qiblad, setQiblad] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus>(
    Location.PermissionStatus.UNDETERMINED,
  )

  const initCompass = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const isAvailable = await Magnetometer.isAvailableAsync()
    if (!isAvailable) {
      setError("Compass is not available on this device")
      setIsLoading(false)
      return
    }

    const { status } = await Location.getForegroundPermissionsAsync()
    setLocationPermissionStatus(status)

    if (status !== Location.PermissionStatus.GRANTED) {
      setError("Please allow location access so we can find Qibla for you")
      setIsLoading(false)
      return
    }

    try {
      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      calculate(latitude, longitude)
    } catch (err) {
      setError("Failed to get your location. Please try again.")
    } finally {
      setIsLoading(false)
      subscribe()
    }
  }, [])

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    setLocationPermissionStatus(status)
    if (status === Location.PermissionStatus.GRANTED) {
      initCompass()
    }
  }

  useEffect(() => {
    initCompass()

    return () => {
      unsubscribe()
    }
  }, [])

  const subscribe = () => {
    Magnetometer.setUpdateInterval(100)
    setSubscription(
      Magnetometer.addListener((data) => {
        setMagnetometer(angle(data))
      }),
    )
  }

  const unsubscribe = () => {
    subscription && subscription.remove()
    setSubscription(null)
  }

  const angle = (magnetometer: any) => {
    let angle = 0
    if (magnetometer) {
      const { x, y } = magnetometer
      if (Math.atan2(y, x) >= 0) {
        angle = Math.atan2(y, x) * (180 / Math.PI)
      } else {
        angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI)
      }
    }
    return Math.round(angle)
  }

  const direction = (degree: number) => {
    if (degree >= 22.5 && degree < 67.5) {
      return "NE"
    } else if (degree >= 67.5 && degree < 112.5) {
      return "E"
    } else if (degree >= 112.5 && degree < 157.5) {
      return "SE"
    } else if (degree >= 157.5 && degree < 202.5) {
      return "S"
    } else if (degree >= 202.5 && degree < 247.5) {
      return "SW"
    } else if (degree >= 247.5 && degree < 292.5) {
      return "W"
    } else if (degree >= 292.5 && degree < 337.5) {
      return "NW"
    } else {
      return "N"
    }
  }

  const degree = (magnetometer: number) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271
  }

  const calculate = (latitude: number, longitude: number) => {
    const PI = Math.PI
    const latk = (21.4225 * PI) / 180.0 // Kaaba latitude
    const longk = (39.8264 * PI) / 180.0 // Kaaba longitude
    const phi = (latitude * PI) / 180.0
    const lambda = (longitude * PI) / 180.0

    const qiblad =
      (180.0 / PI) *
      Math.atan2(Math.sin(longk - lambda), Math.cos(phi) * Math.tan(latk) - Math.sin(phi) * Math.cos(longk - lambda))
    setQiblad(qiblad)
  }

  const compassDirection = direction(degree(magnetometer))
  const compassDegree = degree(magnetometer)
  const compassRotate = 360 - degree(magnetometer)
  const kabaRotate = 360 - degree(magnetometer) + qiblad

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
        <ActivityIndicator size={50} color={isDark ? "#8BC34A" : "#4CAF50"} />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Finding Qibla direction...</Text>
      </View>
    )
  }

  if (locationPermissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>
          Please allow location access so we can find Qibla for you
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, isDark && styles.textDark]}>Qibla Direction</Text>
            <Text style={[styles.headerSubtitle, isDark && styles.subtextDark]}>
              Point your phone towards the Kaaba
            </Text>
          </View>

          <View style={styles.direction}>
            <Text style={[styles.directionText, isDark && styles.textDark]}>{compassDirection}</Text>
            <Text style={[styles.directionDegree, isDark && styles.textDark]}>{compassDegree}°</Text>
          </View>

          <View style={styles.compassContainer}>
            <Image
              source={require("@/assets/images/compass.png")}
              style={[
                styles.compassImage,
                {
                  transform: [
                    {
                      rotate: `${compassRotate}deg`,
                    },
                  ],
                },
              ]}
            />
            <View
              style={[
                styles.kaabaContainer,
                {
                  transform: [
                    {
                      rotate: `${kabaRotate}deg`,
                    },
                  ],
                },
              ]}
            >
              <Image source={require("@/assets/images/kaaba.png")} style={styles.kaabaImage} />
            </View>
          </View>

          <View style={[styles.qiblaInfoContainer, isDark ? styles.qiblaInfoContainerDark : null]}>
            <Image source={require("@/assets/images/kaaba.png")} style={styles.qiblaInfoIcon} />
            <Text style={[styles.qiblaInfoText, isDark && styles.textDark]}>
              Qibla is {qiblad.toFixed(2)}° from North
            </Text>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={[styles.instructionText, isDark && styles.subtextDark]}>
              Hold your phone flat and align the Kaaba icon with the direction you're facing
            </Text>
          </View>
        </>
      )}
    </View>
  )
}
