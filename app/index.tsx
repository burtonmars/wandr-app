import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { FogOverlay } from '../src/components/map/FogOverlay';
import { Text } from '../src/components/nativewindui/Text';
import { ThemeToggle } from '../src/components/nativewindui/ThemeToggle';
import locationService from '../src/services/locationService';
import { AppDispatch, RootState } from '../src/store';
import { addExploredArea, loadExploredAreas } from '../src/store/slices/exploredSlice';
import { noLabelsMapStyle } from '../src/styles/mapStyle';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const currentLocation = useSelector((state: RootState) => state.location.currentLocation);
  const permissionStatus = useSelector((state: RootState) => state.location.permissionStatus);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  
  useEffect(() => {
    dispatch(loadExploredAreas());
    locationService.startTracking();
    locationService.setupBackgroundTracking();
    
    return () => {
      locationService.stopTracking();
    };
  }, [dispatch]);

  // Track explored areas as user moves
  useEffect(() => {
    if (currentLocation) {
      dispatch(addExploredArea({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        precision: 7, // ~150m x 150m cells
      }));
    }
  }, [currentLocation, dispatch]);
  
  if (!currentLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-5">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-lg text-center mt-2">
          {permissionStatus !== 'granted' 
            ? 'Location permission not granted. Please enable in settings.' 
            : 'Getting your current location...'}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={noLabelsMapStyle}
        style={{ flex: 1 }}
        camera={
          {
            center: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            },
            zoom: 15,
            pitch: 0,
            heading: 0,
          }
        }
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {mapRegion && (
          <FogOverlay 
            mapRegion={mapRegion}
            fogColor="#1a1a1a"
            fogOpacity={1.0}
          />
        )}
      </MapView>
      <ThemeToggle />
    </View>
  );
}