import { configureStore } from '@reduxjs/toolkit'
//import exploredReducer from './slices/exploredSlice'
import locationReducer from './slices/locationSlice'
//import poisReducer from './slices/poisSlice'
//import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    //explored: exploredReducer,
    location: locationReducer,
    //user: userReducer,
    //pois: poisReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
