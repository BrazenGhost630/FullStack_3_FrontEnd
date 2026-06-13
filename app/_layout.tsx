import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConfigStore } from '@/stores/useConfigStore';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const { darkMode } = useConfigStore();

  return (
    <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index"      options={{ headerShown: false }} />
        <Stack.Screen name="main-menu"  options={{ headerShown: false }} />
        <Stack.Screen name="login"      options={{ headerShown: false }} />
        <Stack.Screen name="registro"   options={{ headerShown: false }} />
        <Stack.Screen name="terminos"   options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen name="AddGarment" options={{ headerShown: false }} />
        <Stack.Screen name="modal"      options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}