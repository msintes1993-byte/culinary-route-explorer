/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in meters
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Validate if user is within allowed distance of a venue
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param venueLat Venue's latitude
 * @param venueLng Venue's longitude
 * @param maxDistanceMeters Maximum allowed distance in meters (default: 100)
 * @returns Object with validation result and distance
 */
export const validateDistance = (
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  maxDistanceMeters: number = 100
): { isValid: boolean; distance: number } => {
  const distance = calculateHaversineDistance(userLat, userLng, venueLat, venueLng);
  
  return {
    isValid: distance <= maxDistanceMeters,
    distance: Math.round(distance),
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};
