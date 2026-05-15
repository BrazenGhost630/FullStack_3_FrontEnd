import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findComunaByName, CITIES_BOUNDARIES } from '../../data/closet/chileRegions';

export interface LocationData {
  region: string;
  comuna: string;
  cityCode: string; // Añadido para usar en la API de clima
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
      cityCode: geocodedLocation.cityCode,
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

    const { location, timestamp }: { location: LocationData, timestamp: number } = JSON.parse(cached);
    const now = Date.now();

    // 1. Verificar si la caché ha expirado
    if (now - timestamp >= LOCATION_CACHE_DURATION) {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    // 2. Verificar si la caché es moderna y válida (tiene cityCode)
    if (location && location.cityCode) {
      return location;
    }

    // 3. Si no tiene cityCode, es una caché antigua o inválida. Intentar migrar.
    if (location && location.comuna) {
      console.log("Intentando migrar caché de ubicación antigua para:", location.comuna);
      const comunaDetails = findComunaByName(location.comuna);
      if (comunaDetails) {
        // Migración exitosa: crear un objeto completo y guardarlo de nuevo.
        const migratedLocation: LocationData = { ...location, cityCode: comunaDetails.cityCode };
        await saveLocationToCache(migratedLocation);
        console.log("Migración de caché de ubicación exitosa.");
        return migratedLocation;
      }
    }

    // 4. Si la migración falla o el objeto es inválido, se elimina la caché.
    console.warn("La caché de ubicación es inválida o no se pudo migrar. Se eliminará.");
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error procesando la caché de ubicación, se eliminará:', error);
    // Si hay un error (ej. JSON mal formado), lo más seguro es limpiar la caché.
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
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
const reverseGeocode = async (latitude: number, longitude: number): Promise<{ region: string; comuna: string; cityCode: string } | null> => {
  try {
    // Simulación de geocoding inverso.
    // Busca la primera ciudad que contenga las coordenadas.
    for (const city of CITIES_BOUNDARIES) {
      if (
        latitude >= city.latMin &&
        latitude <= city.latMax &&
        longitude >= city.lonMin &&
        longitude <= city.lonMax
      ) {
        return { region: city.region, comuna: city.name, cityCode: city.cityCode };
      }
    }

    // Si no se encuentra ninguna, se devuelve una ubicación por defecto que esté en la lista.
    console.log(`Coordenadas (${latitude}, ${longitude}) no coinciden con ninguna ciudad conocida. Usando fallback: Santiago Centro`);
    return { region: 'Región Metropolitana', comuna: 'Santiago Centro', cityCode: 'SCQN' }; // Fallback con cityCode
  } catch (error) {
    console.error('Error en geocoding inverso simulado:', error);
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
