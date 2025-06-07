import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { noLabelsMapStyle } from '@/src/styles/mapStyle';
import { FogOverlay } from '../src/components/map/FogOverlay';
import { Text } from '../src/components/nativewindui/Text';
import locationService from '../src/services/locationService';
import { AppDispatch, RootState } from '../src/store';
import { addExploredArea, loadExploredAreas } from '../src/store/slices/exploredSlice';

const DEFAULT_REGION: Region = {
  latitude: 49.2827,
  longitude: -123.1207,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const currentLocation = useSelector((state: RootState) => state.location.currentLocation);
  const permissionStatus = useSelector((state: RootState) => state.location.permissionStatus);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const isInitialized = useRef(false);

  useEffect(() => {
    dispatch(loadExploredAreas());
    locationService.startTracking();
    locationService.setupBackgroundTracking();
    return () => {
      locationService.stopTracking();
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentLocation && !isInitialized.current) {
      const userRegion: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01,
      };
      setMapRegion(userRegion);
      isInitialized.current = true;
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) {
      dispatch(
        addExploredArea({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          precision: 7,
        })
      );
    }
  }, [currentLocation, dispatch]);

  if (!isInitialized.current) {
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
      >
        {/* Render the stable Polygon-based fog overlay AS A CHILD of the map */}
        <FogOverlay mapRegion={mapRegion} />
      </MapView>
    </View>
  );
}