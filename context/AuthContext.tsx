import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken as getStoredToken } from '../services/authService';

const AuthContext = createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
}>({
  token: null,
  setToken: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

function useProtectedRoute(token: string | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'registro';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, router]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token in SecureStore
    const loadToken = async () => {
      try {
        const storedToken = await getStoredToken();
        console.log('Token almacenado encontrado:', storedToken ? 'Sí' : 'No');
        setToken(storedToken);
      } catch (error) {
        console.error('Error cargando token almacenado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  useProtectedRoute(token);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}