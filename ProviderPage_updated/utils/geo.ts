/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get user's geolocation with fallback to default
 * @param defaultLat Default latitude if geolocation fails
 * @param defaultLon Default longitude if geolocation fails
 * @returns Promise with coordinates
 */
export const getUserLocation = (defaultLat: number = 40.7128, defaultLon: number = -74.006): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          // Fallback to default location
          resolve({ lat: defaultLat, lon: defaultLon })
        }
      )
    } else {
      // Geolocation not available
      resolve({ lat: defaultLat, lon: defaultLon })
    }
  })
}
