import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  region: string;
  comuna: string;
  latitude: number;
  longitude: number;
}

export interface LocationServiceResult {
  success: boolean;
  location?: LocationData;
  error?: string;
}

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Solicita permisos de geolocalización
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error solicitando permisos de geolocalización:', error);
    return false;
  }
};

/**
 * Obtiene ubicación actual del dispositivo
 */
export const getCurrentLocation = async (): Promise<LocationServiceResult> => {
  try {
    // Verificar permisos
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permiso de geolocalización denegado'
      };
    }

    // Obtener ubicación
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Convertir coordenadas a región y comuna (geocoding inverso)
    const geocodedLocation = await reverseGeocode(latitude, longitude);
    
    if (!geocodedLocation) {
      return {
        success: false,
        error: 'No se pudo determinar la región y comuna'
      };
    }

    const locationData: LocationData = {
      region: geocodedLocation.region,
      comuna: geocodedLocation.comuna,
      latitude,
      longitude,
    };

    // Guardar en caché
    await saveLocationToCache(locationData);

    return {
      success: true,
      location: locationData,
    };
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene ubicación desde caché si es válida
 */
export const getCachedLocation = async (): Promise<LocationData | null> => {
  try {
    const cached = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (!cached) return null;

    const { location, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Verificar si la caché aún es válida
    if (now - timestamp < LOCATION_CACHE_DURATION) {
      return location;
    }

    // Limpiar caché expirada
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error obteniendo ubicación caché:', error);
    return null;
  }
};

/**
 * Guarda ubicación en caché
 */
const saveLocationToCache = async (location: LocationData): Promise<void> => {
  try {
    const cacheData = {
      location,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error guardando ubicación en caché:', error);
  }
};

/**
 * Realiza geocoding inverso para obtener región y comuna
 * NOTA: Esta es una implementación simulada. En producción deberías usar:
 * - API de Google Maps Geocoding
 * - API de OpenStreetMap Nominatim
 * - Servicio específico para Chile (como API del Gobierno)
 */
const reverseGeocode = async (latitude: number, longitude: number): Promise<{ region: string; comuna: string } | null> => {
  try {
    // Simulación de geocoding para Chile
    // En producción, aquí harías una llamada real a una API de geocoding
    
    // Lógica simulada basada en coordenadas aproximadas de Chile
    if (latitude > -33.5 && latitude < -33.3 && longitude > -70.8 && longitude < -70.6) {
      return { region: 'Región Metropolitana', comuna: 'Santiago' };
    } else if (latitude > -33.0 && latitude < -32.8 && longitude > -71.0 && longitude < -70.8) {
      return { region: 'Región Metropolitana', comuna: 'Puente Alto' };
    } else if (latitude > -33.1 && latitude < -32.9 && longitude > -70.9 && longitude < -70.7) {
      return { region: 'Región Metropolitana', comuna: 'La Florida' };
    } else if (latitude > -33.7 && latitude < -33.5 && longitude > -71.0 && longitude < -70.8) {
      return { region: 'Región del Valparaíso', comuna: 'Valparaíso' };
    } else if (latitude > -33.0 && latitude < -32.8 && longitude > -71.6 && longitude < -71.4) {
      return { region: 'Región del Valparaíso', comuna: 'Viña del Mar' };
    } else if (latitude > -36.8 && latitude < -36.6 && longitude > -73.1 && longitude < -72.9) {
      return { region: 'Región del Biobío', comuna: 'Concepción' };
    } else if (latitude > -42.5 && latitude < -42.3 && longitude > -73.8 && longitude < -73.6) {
      return { region: 'Región de Los Lagos', comuna: 'Puerto Montt' };
    } else if (latitude > -18.5 && latitude < -18.3 && longitude > -70.4 && longitude < -70.2) {
      return { region: 'Región de Arica y Parinacota', comuna: 'Arica' };
    } else if (latitude > -23.0 && latitude < -22.8 && longitude > -70.3 && longitude < -70.1) {
      return { region: 'Región de Antofagasta', comuna: 'Antofagasta' };
    } else if (latitude > -53.2 && latitude < -53.0 && longitude > -70.9 && longitude < -70.7) {
      return { region: 'Región de Magallanes', comuna: 'Punta Arenas' };
    } else {
      // Ubicación por defecto si no coincide con ciudades conocidas
      return { region: 'Región Metropolitana', comuna: 'Santiago' };
    }
  } catch (error) {
    console.error('Error en geocoding inverso:', error);
    return null;
  }
};

/**
 * Limpia la caché de ubicación
 */
export const clearLocationCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error limpiando caché de ubicación:', error);
  }
};

/**
 * Verifica si los servicios de geolocalización están habilitados
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Error verificando servicios de geolocalización:', error);
    return false;
  }
};
