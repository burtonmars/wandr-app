export default {
  expo: {
    name: 'wandr-app',
    slug: 'wandr-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'wandrapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.burtonmars.wandrapp',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Wandr needs access to your location to track your exploration progress and unlock new areas even when the app is in the background.',
        NSLocationWhenInUseUsageDescription:
          "Wandr needs access to your location to show your position on the map and track areas you've explored.",
        NSLocationAlwaysUsageDescription:
          'Wandr needs access to your location to track your exploration progress even when the app is closed.',
        UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      },
    },
    android: {
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.burtonmars.wandrapp',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Wandr to use your location to track your exploration progress and unlock new areas even when the app is in the background.',
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'a4b20a49-3700-49e9-a1c4-393aa404f50d',
      },
    },
    owner: 'burtonmars',
  },
}
