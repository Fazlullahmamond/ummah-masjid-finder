"use client"

import type React from "react"
import { forwardRef, useMemo } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Masjid } from "../types"
import PrayerTimesCard from "./prayer-times-card"

// Conditionally import BottomSheetModal
let BottomSheetModal: any = null
let BottomSheetView: any = null

try {
  const BottomSheet = require("@gorhom/bottom-sheet")
  BottomSheetModal = BottomSheet.BottomSheetModal
  BottomSheetView = BottomSheet.BottomSheetView
} catch (error) {
  console.log("BottomSheet module not available")
}

interface MasjidBottomSheetProps {
  snapPoints: string[]
  masjid: Masjid | null
  isFavorite: boolean
  onOpenInMaps: (masjid: Masjid) => void
  onToggleFavorite: (masjid: Masjid) => void
  isDark: boolean
  prayerTimes: any
  children?: React.ReactNode
}

const MasjidBottomSheet = forwardRef<any, MasjidBottomSheetProps>(
  ({ snapPoints, masjid, isFavorite, onOpenInMaps, onToggleFavorite, isDark, prayerTimes, children }, ref) => {
    // If BottomSheetModal is not available, return null
    if (!BottomSheetModal || !masjid) return null

    const backgroundStyle = useMemo(() => {
      return {
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
      }
    }, [isDark])

    const handleStyle = useMemo(() => {
      return {
        backgroundColor: isDark ? "#333333" : "#E0E0E0",
      }
    }, [isDark])

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleStyle}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={[styles.title, isDark && styles.titleDark]}>{masjid.name}</Text>
          <Text style={[styles.address, isDark && styles.addressDark]}>{masjid.address}</Text>

          {masjid.distance && (
            <Text style={[styles.distance, isDark && styles.distanceDark]}>{masjid.distance.toFixed(2)} km away</Text>
          )}

          <View style={styles.actionsContainer}>
            <Pressable
              style={[styles.actionButton, isDark && styles.actionButtonDark]}
              onPress={() => onOpenInMaps(masjid)}
            >
              <Ionicons name="navigate" size={24} color={isDark ? "#8BC34A" : "#4CAF50"} />
              <Text style={[styles.actionText, isDark && styles.actionTextDark]}>Directions</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, isDark && styles.actionButtonDark]}
              onPress={() => onToggleFavorite(masjid)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isDark ? "#8BC34A" : "#4CAF50"}
              />
              <Text style={[styles.actionText, isDark && styles.actionTextDark]}>{isFavorite ? "Saved" : "Save"}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {prayerTimes ? (
            <PrayerTimesCard prayerTimes={prayerTimes} isDark={isDark} />
          ) : (
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading prayer times...</Text>
          )}

          {children}
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  titleDark: {
    color: "#E0E0E0",
  },
  address: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  addressDark: {
    color: "#A0A0A0",
  },
  distance: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 16,
    fontWeight: "500",
  },
  distanceDark: {
    color: "#8BC34A",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F1F8E9",
    flex: 1,
    marginHorizontal: 8,
  },
  actionButtonDark: {
    backgroundColor: "#2D3B21",
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: "#4CAF50",
  },
  actionTextDark: {
    color: "#8BC34A",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
    marginVertical: 20,
  },
  loadingTextDark: {
    color: "#A0A0A0",
  },
})

export default MasjidBottomSheet
