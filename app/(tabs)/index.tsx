import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // TODO: Implementar lógica real de autenticación usando context o AsyncStorage
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}