import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface PrayerTimesCardProps {
  prayerTimes: {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
  }
  isDark: boolean
}

export default function PrayerTimesCard({ prayerTimes, isDark }: PrayerTimesCardProps) {
  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr, icon: "sunny-outline" },
    { name: "Sunrise", time: prayerTimes.sunrise, icon: "sunny" },
    { name: "Dhuhr", time: prayerTimes.dhuhr, icon: "sunny" },
    { name: "Asr", time: prayerTimes.asr, icon: "partly-sunny" },
    { name: "Maghrib", time: prayerTimes.maghrib, icon: "moon-outline" },
    { name: "Isha", time: prayerTimes.isha, icon: "moon" },
  ]

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Prayer Times</Text>

      <View style={styles.timesContainer}>
        {prayers.map((prayer, index) => (
          <View key={prayer.name} style={[styles.prayerRow, index < prayers.length - 1 && styles.rowBorder]}>
            <View style={styles.prayerInfo}>
              <Ionicons name={prayer.icon as any} size={20} color={isDark ? "#8BC34A" : "#4CAF50"} />
              <Text style={[styles.prayerName, isDark && styles.textDark]}>{prayer.name}</Text>
            </View>
            <Text style={[styles.prayerTime, isDark && styles.textDark]}>{prayer.time}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FBF7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: "#1A2613",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  titleDark: {
    color: "#E0E0E0",
  },
  timesContainer: {
    marginTop: 8,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  prayerName: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
  prayerTime: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  textDark: {
    color: "#E0E0E0",
  },
})
