import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as Location from 'expo-location'

interface TrackedLocation {
  latitude: number
  longitude: number
  timestamp: number
}

interface LocationState {
  currentLocation: TrackedLocation | null
  permissionStatus: Location.LocationPermissionResponse['status'] | null
}

const initialState: LocationState = {
  currentLocation: null,
  permissionStatus: null,
}

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (
      state,
      action: PayloadAction<Location.LocationObject>
    ) => {
      state.currentLocation = {
        latitude: action.payload.coords.latitude,
        longitude: action.payload.coords.longitude,
        timestamp: action.payload.timestamp,
      }
    },
    setPermissionStatus: (
      state,
      action: PayloadAction<Location.LocationPermissionResponse['status']>
    ) => {
      state.permissionStatus = action.payload
    },
  },
})

export const { setCurrentLocation, setPermissionStatus } = locationSlice.actions

export default locationSlice.reducer
