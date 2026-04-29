import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from './locationService';

// Configuración - reemplazar con URL real de tu backend
const API_BASE_URL = 'https://tu-api.com/api';

export interface WeatherData {
  temperature: number;
  condition: 'Soleado' | 'Nublado' | 'Lluvioso' | 'Frío' | 'Nevado' | 'Ventoso';
  icon: string;
  recommendation: string;
  location: string;
  isRealData: boolean;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
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
  try {
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: {
        region: location.region,
        comuna: location.comuna,
      },
      timeout: 10000, // 10 segundos timeout
    });

    if (response.data && response.data.success) {
      const weatherData: WeatherData = {
        temperature: response.data.temperature,
        condition: response.data.condition,
        icon: getWeatherIcon(response.data.condition),
        recommendation: response.data.recommendation,
        location: `${location.comuna}, ${location.region}`,
        isRealData: true,
        humidity: response.data.humidity,
        windSpeed: response.data.windSpeed,
        feelsLike: response.data.feelsLike,
      };

      // Guardar en caché
      await saveWeatherToCache(weatherData);

      return {
        success: true,
        weather: weatherData,
      };
    } else {
      return {
        success: false,
        error: 'Respuesta inválida del servidor de clima',
      };
    }
  } catch (error) {
    console.error('Error obteniendo clima del backend:', error);
    
    // Si falla el backend, retornar datos simulados
    const simulatedWeather = getSimulatedWeather(location);
    return {
      success: true,
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
  try {
    // Primero intentar obtener desde caché
    const cachedWeather = await getCachedWeather();
    if (cachedWeather) {
      return {
        success: true,
        weather: cachedWeather,
      };
    }

    // Si no hay caché y tenemos ubicación, intentar obtener del backend
    if (location) {
      return await getWeatherFromBackend(location);
    }

    // Si no hay ubicación, retornar datos simulados
    const simulatedWeather = getSimulatedWeather();
    return {
      success: true,
      weather: simulatedWeather,
    };
  } catch (error) {
    console.error('Error obteniendo clima:', error);
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

/**
 * Verifica si la conexión a internet está disponible
 */
export const checkWeatherAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
