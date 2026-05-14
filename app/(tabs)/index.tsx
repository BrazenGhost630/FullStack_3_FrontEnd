import { Href, useRouter } from 'expo-router';
import React from 'react';
import MyClosetScreen from '../../components/MyClosetScreen';

export default function HomeScreen() {
  const router = useRouter();
  
  // Pasamos un objeto navigation adaptado para Expo Router
  return <MyClosetScreen navigation={{ navigate: (route: string) => router.push(`/${route}` as Href) }} />;
}