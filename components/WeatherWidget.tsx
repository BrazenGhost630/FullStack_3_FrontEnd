import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Prenda } from './useClosetStore';

interface WeatherWidgetProps {
  prendas: Prenda[];
}

interface WeatherData {
  temperature: number;
  condition: 'Soleado' | 'Nublado' | 'Lluvioso' | 'Frío';
  icon: string;
  recommendation: string;
}

const weatherConditions: WeatherData[] = [
  { temperature: 28, condition: 'Soleado', icon: '☀️', recommendation: 'Perfecto para prendas ligeras de verano' },
  { temperature: 22, condition: 'Nublado', icon: '☁️', recommendation: 'Ideal para prendas informales cómodas' },
  { temperature: 18, condition: 'Lluvioso', icon: '🌧️', recommendation: 'Recomendado prendas abrigadas y resistentes al agua' },
  { temperature: 12, condition: 'Frío', icon: '❄️', recommendation: 'Perfecto para prendas de invierno' }
];

export default function WeatherWidget({ prendas }: WeatherWidgetProps) {
  // Clima fijo que cambia cada día (simulado)
  const currentWeather = useMemo(() => {
    const today = new Date().getDate();
    return weatherConditions[today % weatherConditions.length];
  }, []);

  const recommendedPrendas = useMemo(() => {
    if (!prendas.length) return [];
    
    let recommendedSeason: 'Verano' | 'Invierno' = 'Verano';
    
    if (currentWeather.temperature < 20) {
      recommendedSeason = 'Invierno';
    } else if (currentWeather.temperature > 25) {
      recommendedSeason = 'Verano';
    }

    return prendas.filter(prenda => prenda.season === recommendedSeason);
  }, [prendas, currentWeather]);

  return (
    <View style={styles.container}>
      <View style={styles.weatherInfo}>
        <Text style={styles.icon}>{currentWeather.icon}</Text>
        <View style={styles.weatherDetails}>
          <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
          <Text style={styles.condition}>{currentWeather.condition}</Text>
        </View>
      </View>
      <View style={styles.recommendation}>
        <Text style={styles.recommendationTitle}>Recomendación</Text>
        <Text style={styles.recommendationText}>{currentWeather.recommendation}</Text>
        {recommendedPrendas.length > 0 && (
          <Text style={styles.matchCount}>
            {recommendedPrendas.length} prendas ideales para hoy
          </Text>
        )}
      </View>
    </View>
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
  matchCount: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
