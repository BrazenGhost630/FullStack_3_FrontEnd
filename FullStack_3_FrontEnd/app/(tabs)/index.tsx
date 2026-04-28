import { Redirect } from 'expo-router';

export default function HomeScreen() {
  const isLoggedIn = false; // después esto lo cambiás por tu lógica real

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}