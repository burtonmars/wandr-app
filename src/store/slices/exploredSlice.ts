import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import * as geohash from 'ngeohash'

import { RootState } from '../index'

interface ExploredArea {
  geohash: string
  timestamp: number
  precision: number
}
interface ExploredState {
  exploredAreas: ExploredArea[]
  exploredHashMap: Record<string, boolean>
  isLoading: boolean
  isInitialized: boolean
}

const STORAGE_KEY = 'wandr_explored_areas'
const GEOHASH_PRECISION = 7

const initialState: ExploredState = {
  exploredAreas: [],
  exploredHashMap: {},
  isLoading: false,
  isInitialized: false,
}

export const loadExploredAreas = createAsyncThunk(
  'explored/loadFromStorage',
  async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as ExploredArea[]) : []
  }
)

export const exploreNewArea = createAsyncThunk<
  ExploredArea | null,
  { latitude: number; longitude: number; precision?: number },
  { state: RootState }
>('explored/addNewArea', async (payload, { getState }) => {
  const { latitude, longitude, precision = GEOHASH_PRECISION } = payload
  const hash = geohash.encode(latitude, longitude, precision)
  const { exploredHashMap } = getState().explored
  if (exploredHashMap[hash]) {
    return null
  }

  const newArea: ExploredArea = {
    geohash: hash,
    timestamp: Date.now(),
    precision,
  }

  const allAreas = [...getState().explored.exploredAreas, newArea]
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allAreas))

  return newArea
})

export const resetExploredToCurrentLocation = createAsyncThunk<
  ExploredArea[],
  { latitude: number; longitude: number; precision?: number }
>('explored/resetToCurrent', async (payload) => {
  const { latitude, longitude, precision = GEOHASH_PRECISION } = payload
  const hash = geohash.encode(latitude, longitude, precision)
  const currentArea: ExploredArea = {
    geohash: hash,
    timestamp: Date.now(),
    precision,
  }
  const newExploredAreas = [currentArea]

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExploredAreas))

  return newExploredAreas
})

const exploredSlice = createSlice({
  name: 'explored',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadExploredAreas.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadExploredAreas.fulfilled, (state, action) => {
        state.exploredAreas = action.payload
        state.exploredHashMap = action.payload.reduce(
          (map, area) => {
            map[area.geohash] = true
            return map
          },
          {} as Record<string, boolean>
        )
        state.isLoading = false
        state.isInitialized = true
      })
      .addCase(loadExploredAreas.rejected, (state) => {
        state.isLoading = false
        state.isInitialized = true
      })
      .addCase(exploreNewArea.fulfilled, (state, action) => {
        if (action.payload) {
          state.exploredAreas.push(action.payload)
          state.exploredHashMap[action.payload.geohash] = true
        }
      })
      .addCase(resetExploredToCurrentLocation.fulfilled, (state, action) => {
        state.exploredAreas = action.payload
        state.exploredHashMap = {
          [action.payload[0].geohash]: true,
        }
      })
  },
})

const selectExplored = (state: RootState) => state.explored.exploredAreas
const selectBounds = (
  state: RootState,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
) => bounds

export const selectExploredAreasInBounds = createSelector(
  [selectExplored, selectBounds],
  (exploredAreas, bounds) => {
    return exploredAreas.filter((area) => {
      const bbox = geohash.decode_bbox(area.geohash)
      const [minLat, minLng, maxLat, maxLng] = bbox

      return !(
        maxLat < bounds.minLat ||
        minLat > bounds.maxLat ||
        maxLng < bounds.minLng ||
        minLng > bounds.maxLng
      )
    })
  }
)

export default exploredSlice.reducer
