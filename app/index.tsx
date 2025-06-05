import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { Text } from '../components/nativewindui/Text';
import { ThemeToggle } from '../components/nativewindui/ThemeToggle';
import { useLocation } from '../src/hooks/useLocation';
import { RootState } from '../src/store';

export default function App() {
  useLocation();
  
  const currentLocation = useSelector((state: RootState) => state.location.currentLocation);
  const permissionStatus = useSelector((state: RootState) => state.location.permissionStatus);
  
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
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      />
      <ThemeToggle />
    </View>
  );
}