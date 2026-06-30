import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from './locationService';

import { getToken } from '../authService';
import { WEATHER_API_URL } from '../apiConfig';
import { findComunaByName } from '../../data/closet/chileRegions';

export interface WeatherData {
  temperature: number;
  condition: 'Soleado' | 'Nublado' | 'Lluvioso' | 'Frío' | 'Nevado' | 'Ventoso';
  icon: string;
  recommendation: string;
  location: string;
  isRealData: boolean;
  humidity?: number;
  cityCode?: string;
  updatedAt?: string;
  createdAt?: string;
  id?: number;
}

export interface WeatherApiResponse {
  id: number;
  cityCode: string;
  cityName: string;
  temperature: number;
  weatherCondition: 'Soleado' | 'Nublado' | 'Lluvioso' | 'Frío' | 'Nevado' | 'Ventoso';
  humidity: number;
  updatedAt: string;
  createdAt: string;
  message: string;
}

export interface WeatherApiError {
  success: false;
  error: string;
}

export interface WeatherServiceResult {
  success: boolean;
  weather?: WeatherData;
  error?: string;
}

const WEATHER_CACHE_KEY = 'weather_data';
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

/**
 * Obtiene datos del clima desde backend basado en ubicación
 */
export const getWeatherFromBackend = async (location: LocationData): Promise<WeatherServiceResult> => {
  console.log('=== OBTENIENDO CLIMA DEL BACKEND ===');
  console.log('Location:', location);
  console.log('CityCode:', location.cityCode);
  console.log('WEATHER_API_URL:', WEATHER_API_URL);

  try {
    const token = await getToken();
    if (!token) {
      console.error('Usuario no autenticado para obtener clima');
      return { success: false, error: 'Usuario no autenticado.' };
    }

    console.log('Token obtenido:', token ? 'Sí' : 'No');

    // La API espera el cityCode en la URL, ej: /api/weather/code/SCQN
    const url = `${WEATHER_API_URL}/weather/code/${location.cityCode}`;
    console.log('Haciendo request a:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 segundos de timeout
    });

    console.log('Respuesta status:', response.status);
    console.log('Respuesta data:', response.data);

    // Verificar si la respuesta es de error
    if (response.data && response.data.success === false) {
      console.error('Error del servidor de clima:', response.data.error);
      return {
        success: false,
        error: response.data.error || 'Error del servidor de clima',
      };
    }

    // Procesar respuesta exitosa
    if (response.data && response.data.id) {
      const weatherData: WeatherData = {
        temperature: response.data.temperature,
        condition: response.data.weatherCondition,
        icon: getWeatherIcon(response.data.weatherCondition),
        recommendation: generateRecommendation(response.data.weatherCondition, response.data.temperature),
        location: response.data.cityName || `${location.comuna}, ${location.region}`,
        isRealData: true,
        humidity: response.data.humidity,
        cityCode: response.data.cityCode,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
        id: response.data.id,
      };

      console.log('Clima obtenido exitosamente:', weatherData);

      // Guardar en caché
      await saveWeatherToCache(weatherData);

      return {
        success: true,
        weather: weatherData,
      };
    } else {
      console.error('Respuesta inválida del servidor de clima:', response.data);
      return {
        success: false,
        error: 'Respuesta inválida del servidor de clima',
      };
    }
  } catch (error) {
    console.error('Error obteniendo clima del backend:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error - Status:', error.response?.status);
      console.error('Axios error - Data:', error.response?.data);
      console.error('Axios error - Message:', error.message);
    }
    
    // Si la llamada al backend falla, retornamos datos simulados como fallback.
    console.log('Usando datos simulados como fallback');
    const simulatedWeather = getSimulatedWeather(location);
    return {
      success: true, // Marcamos como éxito para que el widget lo muestre
      weather: simulatedWeather,
    };
  }
};

/**
 * Obtiene clima desde caché si es válido
 */
export const getCachedWeather = async (): Promise<WeatherData | null> => {
  try {
    const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const { weather, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Verificar si la caché aún es válida
    if (now - timestamp < WEATHER_CACHE_DURATION) {
      return weather;
    }

    // Limpiar caché expirada
    await AsyncStorage.removeItem(WEATHER_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error obteniendo clima caché:', error);
    return null;
  }
};

/**
 * Guarda datos del clima en caché
 */
const saveWeatherToCache = async (weather: WeatherData): Promise<void> => {
  try {
    const cacheData = {
      weather,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error guardando clima en caché:', error);
  }
};

/**
 * Obtiene clima real o simulado basado en ubicación
 */
export const getWeather = async (location?: LocationData): Promise<WeatherServiceResult> => {
  console.log('=== GET WEATHER ===');
  console.log('Location recibida:', location);

  try {
    let validLocation = location;

    // **MIGRATION/VALIDATION LOGIC**
    // Si la ubicación que llega no tiene cityCode (porque viene de un estado antiguo),
    // intentamos repararla antes de continuar.
    if (validLocation && !validLocation.cityCode && validLocation.comuna) {
      console.log("getWeather recibió una ubicación sin cityCode. Intentando migrarla...");
      const comunaDetails = findComunaByName(validLocation.comuna);
      if (comunaDetails) {
        validLocation = { ...validLocation, cityCode: comunaDetails.cityCode };
        console.log("Migración de ubicación en getWeather exitosa. Nuevo cityCode:", validLocation.cityCode);
      } else {
        console.warn(`No se pudo migrar la ubicación en getWeather para "${validLocation.comuna}". Se usará data simulada.`);
        validLocation = undefined; // Invalidar para forzar fallback
      }
    }

    // Primero intentar obtener desde caché
    const cachedWeather = await getCachedWeather();

    // Si hay caché, verificar si corresponde a la ubicación actual antes de usarla.
    // Ahora también comparamos por cityCode para mayor precisión.
    if (cachedWeather && validLocation && cachedWeather.cityCode === validLocation.cityCode) {
      console.log('Usando clima desde caché para:', validLocation.comuna, '(', validLocation.cityCode, ')');
      return {
        success: true,
        weather: cachedWeather,
      };
    }

    // Si tenemos una ubicación válida, intentar obtener del backend.
    if (validLocation) {
      console.log('Obteniendo nuevo clima del backend para:', validLocation.comuna);
      return await getWeatherFromBackend(validLocation);
    }

    // Fallback: Si no hay ubicación, retornar datos simulados.
    console.log('No hay ubicación válida, usando datos simulados');
    const simulatedWeather = getSimulatedWeather();
    return {
      success: true,
      weather: simulatedWeather,
    };
  } catch (error) {
    console.error('Error obteniendo clima:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Genera datos simulados de clima (fallback)
 */
const getSimulatedWeather = (location?: LocationData): WeatherData => {
  // Clima fijo que cambia cada día (simulación existente)
  const today = new Date().getDate();
  const weatherConditions = [
    { 
      temperature: 28, 
      condition: 'Soleado' as const, 
      recommendation: 'Perfecto para prendas ligeras de verano',
      humidity: 45,
      windSpeed: 10,
      feelsLike: 30
    },
    { 
      temperature: 22, 
      condition: 'Nublado' as const, 
      recommendation: 'Ideal para prendas informales cómodas',
      humidity: 60,
      windSpeed: 15,
      feelsLike: 21
    },
    { 
      temperature: 18, 
      condition: 'Lluvioso' as const, 
      recommendation: 'Recomendado prendas abrigadas y resistentes al agua',
      humidity: 80,
      windSpeed: 20,
      feelsLike: 16
    },
    { 
      temperature: 12, 
      condition: 'Frío' as const, 
      recommendation: 'Perfecto para prendas de invierno',
      humidity: 70,
      windSpeed: 25,
      feelsLike: 10
    },
    { 
      temperature: 8, 
      condition: 'Nevado' as const, 
      recommendation: 'Necesitas abrigo grueso y gorro',
      humidity: 85,
      windSpeed: 30,
      feelsLike: 5
    },
    { 
      temperature: 25, 
      condition: 'Ventoso' as const, 
      recommendation: 'Buen día para prendas que no se vuelen con el viento',
      humidity: 50,
      windSpeed: 35,
      feelsLike: 23
    },
  ];

  const currentWeather = weatherConditions[today % weatherConditions.length];
  
  return {
    ...currentWeather,
    icon: getWeatherIcon(currentWeather.condition),
    location: location ? `${location.comuna}, ${location.region}` : 'Ubicación desconocida',
    isRealData: false,
  };
};

/**
 * Genera recomendación basada en la condición del clima y temperatura
 */
const generateRecommendation = (condition: string, temperature: number): string => {
  const recommendations: Record<string, string> = {
    'Soleado': 'Perfecto para prendas ligeras de verano',
    'Nublado': 'Ideal para prendas informales cómodas',
    'Lluvioso': 'Recomendado prendas abrigadas y resistentes al agua',
    'Frío': 'Perfecto para prendas de invierno',
    'Nevado': 'Necesitas abrigo grueso y gorro',
    'Ventoso': 'Buen día para prendas que no se vuelen con el viento',
  };

  // Ajustar recomendación basada en temperatura extrema
  if (temperature < 10) {
    return 'Necesitas abrigo grueso y ropa térmica';
  } else if (temperature > 25) {
    return 'Perfecto para prendas ligeras y frescas';
  }

  return recommendations[condition] || 'Vístete cómodamente para el clima actual';
};

/**
 * Obtiene el ícono apropiado para la condición del clima
 */
const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    'Soleado': '☀️',
    'Nublado': '☁️',
    'Lluvioso': '🌧️',
    'Frío': '❄️',
    'Nevado': '🌨️',
    'Ventoso': '💨',
  };

  return iconMap[condition] || '🌤️';
};

/**
 * Limpia la caché del clima
 */
export const clearWeatherCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WEATHER_CACHE_KEY);
  } catch (error) {
    console.error('Error limpiando caché del clima:', error);
  }
};
