import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Prenda } from './useClosetStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { getWeather, WeatherData } from '../../services/closet/weatherService';

interface WeatherWidgetProps {
  prendas: Prenda[];
}

export default function WeatherWidget({ prendas }: WeatherWidgetProps) {
  const { currentLocation, locationEnabled, isLoading: locationLoading, updateLocation } = useConfigStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del clima
  useEffect(() => {
    const loadWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getWeather(currentLocation || undefined);
        
        if (result.success && result.weather) {
          setWeather(result.weather);
        } else {
          setError(result.error || 'Error cargando clima');
        }
      } catch (err) {
        setError('Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    loadWeather();
  }, [currentLocation]);

  // Refrescar clima manualmente
  const handleRefresh = async () => {
    if (locationEnabled) {
      await updateLocation();
    }
    
    // Recargar clima
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getWeather(currentLocation || undefined);
      
      if (result.success && result.weather) {
        setWeather(result.weather);
      } else {
        setError(result.error || 'Error cargando clima');
      }
    } catch (err) {
      setError('Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const currentWeather = weather;

  const recommendedPrendas = useMemo(() => {
    if (!prendas.length || !currentWeather) return [];
    
    let recommendedSeason: 'Verano' | 'Invierno' = 'Verano';
    
    if (currentWeather.temperature < 20) {
      recommendedSeason = 'Invierno';
    } else if (currentWeather.temperature > 25) {
      recommendedSeason = 'Verano';
    }

    return prendas.filter(prenda => prenda.season === recommendedSeason);
  }, [prendas, currentWeather]);

  if (isLoading || locationLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando clima...</Text>
        </View>
      </View>
    );
  }

  if (error || !currentWeather) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el clima</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleRefresh}>
      <View style={styles.weatherInfo}>
        <Text style={styles.icon}>{currentWeather.icon}</Text>
        <View style={styles.weatherDetails}>
          <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
          <Text style={styles.condition}>{currentWeather.condition}</Text>
          <Text style={styles.locationText}>{currentWeather.location}</Text>
        </View>
      </View>
      <View style={styles.recommendation}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationTitle}>Recomendación</Text>
          {!currentWeather.isRealData && (
            <Text style={styles.simulatedText}>Simulado</Text>
          )}
        </View>
        <Text style={styles.recommendationText}>{currentWeather.recommendation}</Text>
        {recommendedPrendas.length > 0 && (
          <Text style={styles.matchCount}>
            {recommendedPrendas.length} prendas ideales para hoy
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  weatherDetails: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recommendation: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  recommendationText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  simulatedText: {
    fontSize: 10,
    color: '#ff9800',
    fontStyle: 'italic',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchCount: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
