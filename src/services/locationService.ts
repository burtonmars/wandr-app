import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import geohash from 'ngeohash'
import { store } from '../store'
import {
  setIsTracking,
  setLocation,
  setLocationError,
  setPermissionStatus,
  setTrackingMode,
} from '../store/slices/locationSlice'

const BACKGROUND_LOCATION_TASK = 'wandr-background-location'

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null
  private lastProcessedLocation: {
    lat: number
    lng: number
    time: number
  } | null = null

  private readonly configs = {
    high: {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000, // 1 second
      distanceInterval: 5, // 5 meters
    },
    balanced: {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 3000, // 3 seconds
      distanceInterval: 10, // 10 meters
    },
    low: {
      accuracy: Location.Accuracy.Low,
      timeInterval: 10000, // 10 seconds
      distanceInterval: 50, // 50 meters
    },
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync()
      store.dispatch(setPermissionStatus(foregroundStatus))

      if (foregroundStatus !== 'granted') {
        store.dispatch(setLocationError('Location permission not granted'))
        return false
      }

      // Request background permission if foreground is granted
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync()

      if (backgroundStatus !== 'granted') {
        console.warn(
          'Background location permission not granted - background tracking disabled'
        )
      }

      return true
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? `Permission error: ${(error as { message: string }).message}`
          : `Permission error: ${String(error)}`
      store.dispatch(setLocationError(errorMessage))
      return false
    }
  }

  async startTracking(): Promise<void> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return

    try {
      const state = store.getState()
      const mode = state.location.trackingMode
      const config = this.configs[mode]

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: config.accuracy,
      })

      this.processLocation(currentLocation)

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          timeInterval: config.timeInterval,
          distanceInterval: config.distanceInterval,
        },
        (location) => this.processLocation(location)
      )

      store.dispatch(setIsTracking(true))
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? `Tracking error: ${(error as { message: string }).message}`
          : 'Tracking error: Unknown error'
      store.dispatch(setLocationError(errorMessage))
    }
  }

  async stopTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove()
      this.locationSubscription = null
    }

    store.dispatch(setIsTracking(false))
  }

  private processLocation(location: Location.LocationObject): void {
    const { coords, timestamp } = location
    const { latitude, longitude } = coords
    const now = Date.now()

    if (coords.speed !== null && coords.speed !== undefined) {
      const speedKmh = coords.speed * 3.6
      const newMode = this.determineTrackingMode(speedKmh)
      const currentMode = store.getState().location.trackingMode

      if (newMode !== currentMode) {
        store.dispatch(setTrackingMode(newMode))
        this.restartTracking()
      }
    }

    if (this.shouldSkipUpdate(latitude, longitude, now)) {
      return
    }

    store.dispatch(
      setLocation({
        latitude,
        longitude,
        altitude: coords.altitude,
        accuracy: coords.accuracy,
        speed: coords.speed,
        heading: coords.heading,
        timestamp: now,
      })
    )

    this.lastProcessedLocation = { lat: latitude, lng: longitude, time: now }

    const hash = geohash.encode(latitude, longitude, 9)
    this.emitLocationUpdate(latitude, longitude, hash)
  }

  private shouldSkipUpdate(lat: number, lng: number, time: number): boolean {
    if (!this.lastProcessedLocation) return false

    const state = store.getState()
    const config = this.configs[state.location.trackingMode]

    const timeDiff = time - this.lastProcessedLocation.time
    const distance = this.calculateDistance(
      this.lastProcessedLocation.lat,
      this.lastProcessedLocation.lng,
      lat,
      lng
    )

    return timeDiff < config.timeInterval && distance < config.distanceInterval
  }

  private determineTrackingMode(speedKmh: number): 'high' | 'balanced' | 'low' {
    if (speedKmh > 50) {
      return 'low'
    } else if (speedKmh > 10) {
      return 'balanced'
    } else {
      return 'high'
    }
  }

  private async restartTracking(): Promise<void> {
    if (this.locationSubscription) {
      await this.stopTracking()
      await this.startTracking()
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000
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

  private emitLocationUpdate(lat: number, lng: number, geohash: string): void {
    // TODO: emit events for other services here instead of console.log
    console.log(`Location update: ${lat}, ${lng} -> ${geohash}`)
  }

  async setupBackgroundTracking(): Promise<void> {
    TaskManager.defineTask(
      BACKGROUND_LOCATION_TASK,
      async ({ data, error }) => {
        if (error) {
          console.error('Background location error:', error)
          return
        }

        const { locations } = data as any
        const location = locations[0]

        if (location) {
          const { coords } = location
          store.dispatch(
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
              altitude: coords.altitude,
              accuracy: coords.accuracy,
              speed: coords.speed,
              heading: coords.heading,
              timestamp: Date.now(),
            })
          )
        }
      }
    )
  }

  async startBackgroundTracking(): Promise<void> {
    const isTaskDefined = await TaskManager.isTaskDefined(
      BACKGROUND_LOCATION_TASK
    )

    if (!isTaskDefined) {
      console.error('Background task is not defined')
      return
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    )

    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
        deferredUpdatesInterval: 60000, // Batch updates every minute
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Wandr is tracking your exploration',
          notificationBody: 'Discovering new areas as you move',
        },
      })
    }
  }
}

export default new LocationService()
