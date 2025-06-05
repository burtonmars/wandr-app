import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as Location from 'expo-location'

interface LocationState {
  currentLocation: {
    latitude: number
    longitude: number
    altitude: number | null
    accuracy: number | null
    speed: number | null // m/s
    heading: number | null
    timestamp: number
  } | null
  permissionStatus: Location.PermissionStatus | null
  isTracking: boolean
  trackingMode: 'high' | 'balanced' | 'low'
  lastError: string | null
  stats: {
    lastUpdateTime: number
    updateCount: number
    distanceTraveled: number // meters
  }
}

const initialState: LocationState = {
  currentLocation: null,
  permissionStatus: null,
  isTracking: false,
  trackingMode: 'balanced',
  lastError: null,
  stats: {
    lastUpdateTime: 0,
    updateCount: 0,
    distanceTraveled: 0,
  },
}

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<LocationState['currentLocation']>
    ) => {
      const newLocation = action.payload
      if (!newLocation) return

      // Calculate distance traveled
      if (state.currentLocation) {
        const distance = calculateDistance(
          state.currentLocation.latitude,
          state.currentLocation.longitude,
          newLocation.latitude,
          newLocation.longitude
        )
        state.stats.distanceTraveled += distance
      }

      state.currentLocation = newLocation
      state.stats.lastUpdateTime = newLocation.timestamp
      state.stats.updateCount += 1
      state.lastError = null
    },

    setPermissionStatus: (
      state,
      action: PayloadAction<Location.PermissionStatus>
    ) => {
      state.permissionStatus = action.payload
    },

    setIsTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload
    },

    setTrackingMode: (
      state,
      action: PayloadAction<LocationState['trackingMode']>
    ) => {
      state.trackingMode = action.payload
    },

    setLocationError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload
    },

    resetLocationStats: (state) => {
      state.stats = {
        lastUpdateTime: 0,
        updateCount: 0,
        distanceTraveled: 0,
      }
    },
  },
})

// Helper function for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
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

export const {
  setLocation,
  setPermissionStatus,
  setIsTracking,
  setTrackingMode,
  setLocationError,
  resetLocationStats,
} = locationSlice.actions

export default locationSlice.reducer
