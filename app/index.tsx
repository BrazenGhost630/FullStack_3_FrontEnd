import { Redirect } from 'expo-router';
import React from 'react';

export default function StartPage() {
  // Redirige incondicionalmente a la pantalla de login.
  return <Redirect href="/login" />;
}
