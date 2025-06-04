import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform } from 'react-native';
import { Text } from '../components/nativewindui/Text';

export default function App() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View 
    style={{ flex: 1 }}
    cameraPosition={{
      coordinates: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      zoom: 15,
    }}
    />;
  } else if (Platform.OS === 'android') {
    return <><GoogleMaps.View 
    style={{ flex: .9 }}
    cameraPosition={{
      coordinates: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      zoom: 15,
    }}
    />
    </>;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}