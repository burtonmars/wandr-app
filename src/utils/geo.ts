/**
 * Creates a square polygon centered at a specific coordinate.
 * @param center The center of the square { latitude: number, longitude: number }.
 * @param sizeInMeters The width and height of the square in meters.
 * @returns An array of coordinates representing the square's corners.
 */
export const createSquarePolygon = (
  center: { latitude: number; longitude: number },
  sizeInMeters: number
): { latitude: number; longitude: number }[] => {
  const earthRadius = 6378137 // in meters

  // Calculate the offsets in degrees
  const latDiff = (sizeInMeters / 2 / earthRadius) * (180 / Math.PI)
  const lngDiff =
    (sizeInMeters /
      2 /
      (earthRadius * Math.cos((Math.PI * center.latitude) / 180))) *
    (180 / Math.PI)

  const minLat = center.latitude - latDiff
  const maxLat = center.latitude + latDiff
  const minLng = center.longitude - lngDiff
  const maxLng = center.longitude + lngDiff

  // Return corners for the hole
  return [
    { latitude: minLat, longitude: minLng },
    { latitude: maxLat, longitude: minLng },
    { latitude: maxLat, longitude: maxLng },
    { latitude: minLat, longitude: maxLng },
  ]
}
