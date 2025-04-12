// Constants for Kaaba coordinates
const KAABA_LATITUDE = 21.4225
const KAABA_LONGITUDE = 39.8262

/**
 * Calculate the Qibla direction from a given location
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns Qibla direction in degrees from North
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  // Convert all coordinates from degrees to radians
  const lat1 = toRadians(latitude)
  const lon1 = toRadians(longitude)
  const lat2 = toRadians(KAABA_LATITUDE)
  const lon2 = toRadians(KAABA_LONGITUDE)

  // Calculate the Qibla direction using the spherical law of cosines
  const y = Math.sin(lon2 - lon1)
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1)

  // Convert the result from radians to degrees
  let qiblaDirection = toDegrees(Math.atan2(y, x))

  // Normalize to 0-360 degrees
  qiblaDirection = (qiblaDirection + 360) % 360

  return qiblaDirection
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}
