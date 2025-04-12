// Masjid type definition
export interface Masjid {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    distance?: number // Distance from user in kilometers
  }
  
  // Location type definition
  export interface Location {
    latitude: number
    longitude: number
  }
  
  // Prayer Times type definition
  export interface PrayerTimes {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
  }
  