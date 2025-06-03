import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text } from 'react-native';

export default function App() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View 
    style={{ flex: 1 }}
    cameraPosition={{
      coordinates: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      zoom: 15,
    }}
    />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}