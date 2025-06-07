import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import geohash from 'ngeohash'

import { RootState } from '../index'

interface ExploredArea {
  geohash: string
  timestamp: number
  precision: number
}

interface ExploredState {
  exploredAreas: ExploredArea[]
  exploredHashMap: Record<string, boolean> // Changed from Set to object
  isLoading: boolean
}

const STORAGE_KEY = 'wandr_explored_areas'

const initialState: ExploredState = {
  exploredAreas: [],
  exploredHashMap: {},
  isLoading: false,
}

// Load explored areas from storage
export const loadExploredAreas = createAsyncThunk('explored/load', async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY)
  if (stored) {
    const data = JSON.parse(stored) as ExploredArea[]
    return data
  }
  return []
})

const exploredSlice = createSlice({
  name: 'explored',
  initialState,
  reducers: {
    addExploredArea: (
      state,
      action: PayloadAction<{
        latitude: number
        longitude: number
        precision?: number
      }>
    ) => {
      const { latitude, longitude, precision = 7 } = action.payload
      const hash = geohash.encode(latitude, longitude, precision)

      // Skip if already explored
      if (state.exploredHashMap[hash]) {
        return
      }

      const newArea: ExploredArea = {
        geohash: hash,
        timestamp: Date.now(),
        precision,
      }

      state.exploredAreas.push(newArea)
      state.exploredHashMap[hash] = true

      // Save to storage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.exploredAreas))
    },
  },

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

export const { addExploredArea } = exploredSlice.actions
export default exploredSlice.reducer
