import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { noLabelsMapStyle } from '@/src/styles/mapStyle';
import { FogOverlay } from '../src/components/map/FogOverlay';
import { Text } from '../src/components/nativewindui/Text';
import locationService from '../src/services/locationService';
import { AppDispatch, RootState } from '../src/store';
import { exploreNewArea, loadExploredAreas, resetExploredToCurrentLocation } from '../src/store/slices/exploredSlice';

const DEFAULT_REGION: Region = {
  latitude: 49.2827,
  longitude: -123.1207,
  latitudeDelta: 0.022,
  longitudeDelta: 0.0421,
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const currentLocation = useSelector((state: RootState) => state.location.currentLocation);
  const permissionStatus = useSelector((state: RootState) => state.location.permissionStatus);
  const { isInitialized: isExploredInitialized } = useSelector((state: RootState) => state.explored);

  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    dispatch(loadExploredAreas());
    locationService.startTracking();
    locationService.setupBackgroundTracking();
    return () => {
      locationService.stopTracking();
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentLocation && isExploredInitialized) {
      dispatch(
        exploreNewArea({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          precision: 7,
        })
      );

      if (!isMapReady) {
        setMapRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.001,
        });
        setIsMapReady(true);
      }
    }
  }, [currentLocation, isExploredInitialized, dispatch, isMapReady]);

  const handleResetExplored = () => {
    if (currentLocation) {
      console.log('Resetting explored areas to current location...');
      dispatch(
        resetExploredToCurrentLocation({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })
      );
    } else {
      // Optionally, show an alert if location is not available
      alert('Current location not found. Cannot reset.');
    }
  };

  if (!isMapReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-5">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-lg text-center mt-2">
          {permissionStatus !== 'granted'
            ? 'Waiting for location permission...'
            : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        customMapStyle={noLabelsMapStyle}
        zoomControlEnabled={true}
        minZoomLevel={12}
        maxZoomLevel={16}
      >
        <FogOverlay mapRegion={mapRegion} />
      </MapView>
      <View className="absolute bottom-5 left-5 right-5">
        <Button
          title="Reset Explored to Current Location"
          onPress={handleResetExplored}
          color="#FF6347"
        />
      </View>
    </View>
  );
}