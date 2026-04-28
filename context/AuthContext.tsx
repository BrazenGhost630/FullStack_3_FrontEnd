import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
    const inAuthGroup = segments[0] === '(auth)';

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
    // Here you would typically check for a stored token (e.g., in AsyncStorage)
    // For now, we'll just simulate a loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  useProtectedRoute(token);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}