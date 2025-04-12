import AsyncStorage from "@react-native-async-storage/async-storage"

// Cache key prefix for prayer times
const PRAYER_TIMES_CACHE_PREFIX = "prayer_times_"

// Function to fetch prayer times using AlAdhan API
export async function fetchPrayerTimes(latitude: number, longitude: number): Promise<any> {
  try {
    const today = new Date()
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
    const cacheKey = `${PRAYER_TIMES_CACHE_PREFIX}${latitude.toFixed(4)}_${longitude.toFixed(4)}_${dateStr}`

    // Check cache first
    const cachedData = await AsyncStorage.getItem(cacheKey)
    if (cachedData) {
      return JSON.parse(cachedData)
    }

    // If not in cache, fetch from API
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.code === 200 && data.data && data.data.timings) {
      const prayerTimes = {
        fajr: formatTime(data.data.timings.Fajr),
        sunrise: formatTime(data.data.timings.Sunrise),
        dhuhr: formatTime(data.data.timings.Dhuhr),
        asr: formatTime(data.data.timings.Asr),
        maghrib: formatTime(data.data.timings.Maghrib),
        isha: formatTime(data.data.timings.Isha),
      }

      // Cache the results
      await AsyncStorage.setItem(cacheKey, JSON.stringify(prayerTimes))

      return prayerTimes
    } else {
      throw new Error("Invalid response from AlAdhan API")
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error)
    throw error
  }
}

// Helper function to format time from 24-hour to 12-hour format
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
