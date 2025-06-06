import { configureStore } from '@reduxjs/toolkit'
import exploredReducer from './slices/exploredSlice'
import locationReducer from './slices/locationSlice'
//import poisReducer from './slices/poisSlice'
//import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    location: locationReducer,
    explored: exploredReducer,
    //pois: poisReducer,
    //user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
