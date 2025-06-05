import * as Location from 'expo-location'
import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import {
  setCurrentLocation,
  setPermissionStatus,
} from '../store/slices/locationSlice'

export const useLocation = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    ;(async () => {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync()
      dispatch(setPermissionStatus(status))

      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      dispatch(setCurrentLocation(location))

      // Optional: Watch for location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (newLocation) => {
          dispatch(setCurrentLocation(newLocation))
        }
      )

      // Cleanup subscription on unmount
      return () => {
        locationSubscription.remove()
      }
    })()
  }, [dispatch])
}
