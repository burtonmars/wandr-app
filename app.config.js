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
    },
    android: {
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
        'expo-maps',
        {
          requestLocationPermission: true,
          locationPermission: 'Allow Wandr to use your location',
          android: {
            apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
          ios: {
            apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
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
