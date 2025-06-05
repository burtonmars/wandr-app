import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import 'expo-dev-client';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';

import '../global.css';
import { useColorScheme, useInitialAndroidBarSync } from '../lib/useColorScheme';
import { store } from '../src/store';
import { NAV_THEME } from '../theme';

export {
  ErrorBoundary
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <Provider store={ store }>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />

      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack />
      </NavThemeProvider>
    </Provider>
  );
}
