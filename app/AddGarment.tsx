import { useRouter } from 'expo-router';
import React from 'react';
import AddGarmentScreen from '../components/AddGarmentScreen';

export default function AddGarmentRoute() {
  const router = useRouter();
  // Mapeamos el botón de volver para usar el router de Expo
  return <AddGarmentScreen navigation={{ goBack: () => router.back() }} />;
}