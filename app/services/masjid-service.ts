import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Masjid } from "../types"

// Cache key for storing masjids
const MASJIDS_CACHE_KEY = "masjids_cache"

// Function to fetch nearby masjids using Overpass API
export async function fetchNearbyMasjids(latitude: number, longitude: number, radiusKm = 5): Promise<Masjid[]> {
  try {
    // Convert radius to meters
    const radiusMeters = radiusKm * 1000

    // Overpass API query to find mosques (amenity=place_of_worship and religion=muslim)
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
        relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
      );
      out center;
    `

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the response into our Masjid type
    const masjids: Masjid[] = data.elements.map((element: any) => {
      // Get coordinates based on element type
      let lat, lon
      if (element.type === "node") {
        lat = element.lat
        lon = element.lon
      } else {
        // For ways and relations, use the center point
        lat = element.center.lat
        lon = element.center.lon
      }

      // Calculate distance from user
      const distance = calculateDistance(latitude, longitude, lat, lon)

      return {
        id: `${element.type}-${element.id}`,
        name: element.tags.name || "Unnamed Masjid",
        address: formatAddress(element.tags),
        latitude: lat,
        longitude: lon,
        distance: distance,
      }
    })

    // Sort by distance
    masjids.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))

    // Cache the results
    await AsyncStorage.setItem(
      MASJIDS_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        userLocation: { latitude, longitude },
        masjids,
      }),
    )

    return masjids
  } catch (error) {
    console.error("Error fetching masjids:", error)

    // Try to load from cache if network request fails
    try {
      const cachedData = await AsyncStorage.getItem(MASJIDS_CACHE_KEY)
      if (cachedData) {
        const { masjids } = JSON.parse(cachedData)
        return masjids
      }
    } catch (cacheError) {
      console.error("Error loading from cache:", cacheError)
    }

    throw error
  }
}

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Helper function to format address from OSM tags
function formatAddress(tags: any): string {
  const addressParts = []

  if (tags["addr:housenumber"] && tags["addr:street"]) {
    addressParts.push(`${tags["addr:housenumber"]} ${tags["addr:street"]}`)
  } else if (tags["addr:street"]) {
    addressParts.push(tags["addr:street"])
  }

  if (tags["addr:city"]) {
    addressParts.push(tags["addr:city"])
  }

  if (tags["addr:postcode"]) {
    addressParts.push(tags["addr:postcode"])
  }

  if (addressParts.length === 0) {
    // If no address information, use other available tags
    if (tags.street) addressParts.push(tags.street)
    if (tags.city) addressParts.push(tags.city)
    if (tags.village) addressParts.push(tags.village)
  }

  return addressParts.length > 0 ? addressParts.join(", ") : "Address unavailable"
}
