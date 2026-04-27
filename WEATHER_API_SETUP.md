# Configuración de API de Clima - ¿Qué me pongo?

## Overview

La app ahora está configurada para obtener clima real basado en la ubicación del usuario (región y comuna) desde tu backend. Esta documentación describe los endpoints necesarios y cómo implementarlos.

## Endpoints Requeridos

### 1. GET `/api/health`
Endpoint para verificar que el backend está disponible.

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### 2. GET `/api/weather`
Endpoint principal para obtener datos del clima basado en ubicación.

**Parámetros Query:**
- `region`: Región de Chile (ej: "Región Metropolitana")
- `comuna`: Comuna (ej: "Santiago")

**Ejemplo de llamada:**
```
GET /api/weather?region=Región Metropolitana&comuna=Santiago
```

**Respuesta esperada:**
```json
{
  "success": true,
  "temperature": 22,
  "condition": "Soleado",
  "recommendation": "Perfecto para prendas ligeras de verano",
  "humidity": 45,
  "windSpeed": 10,
  "feelsLike": 21
}
```

**Posibles condiciones:**
- `Soleado`
- `Nublado`
- `Lluvioso`
- `Frío`
- `Nevado`
- `Ventoso`

## Implementación del Backend

### Opción 1: Usar API de Terceros (Recomendado)

Puedes integrar con servicios de clima como:

#### OpenWeatherMap
```javascript
const axios = require('axios');

const getWeatherFromOpenWeather = async (comuna, region) => {
  try {
    // Mapear comunas a coordenadas aproximadas
    const coordinates = getCoordinatesForComuna(comuna, region);
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        }
      }
    );

    const weather = response.data;
    return {
      temperature: Math.round(weather.main.temp),
      condition: mapWeatherCondition(weather.weather[0].main),
      recommendation: getRecommendation(weather.main.temp, weather.weather[0].main),
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      feelsLike: Math.round(weather.main.feels_like)
    };
  } catch (error) {
    throw new Error('Error obteniendo clima de OpenWeatherMap');
  }
};
```

#### WeatherAPI
```javascript
const getWeatherFromWeatherAPI = async (comuna, region) => {
  try {
    const coordinates = getCoordinatesForComuna(comuna, region);
    
    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json`,
      {
        params: {
          key: process.env.WEATHERAPI_KEY,
          q: `${coordinates.lat},${coordinates.lng}`,
          lang: 'es'
        }
      }
    );

    const weather = response.data.current;
    return {
      temperature: Math.round(weather.temp_c),
      condition: mapWeatherCondition(weather.condition.text),
      recommendation: getRecommendation(weather.temp_c, weather.condition.text),
      humidity: weather.humidity,
      windSpeed: weather.wind_kph / 3.6, // Convertir km/h a m/s
      feelsLike: Math.round(weather.feelslike_c)
    };
  } catch (error) {
    throw new Error('Error obteniendo clima de WeatherAPI');
  }
};
```

### Opción 2: Datos Simulados (Para Desarrollo)

Si no quieres usar APIs de terceros inicialmente:

```javascript
const getSimulatedWeather = (comuna, region) => {
  const conditions = [
    { temperature: 28, condition: 'Soleado', recommendation: 'Perfecto para prendas ligeras de verano' },
    { temperature: 22, condition: 'Nublado', recommendation: 'Ideal para prendas informales cómodas' },
    { temperature: 18, condition: 'Lluvioso', recommendation: 'Recomendado prendas abrigadas y resistentes al agua' },
    { temperature: 12, condition: 'Frío', recommendation: 'Perfecto para prendas de invierno' },
    { temperature: 8, condition: 'Nevado', recommendation: 'Necesitas abrigo grueso y gorro' },
    { temperature: 25, condition: 'Ventoso', recommendation: 'Buen día para prendas que no se vuelen con el viento' }
  ];

  // Variar el clima basado en la comuna para que no sea siempre el mismo
  const hash = comuna.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const weather = conditions[hash % conditions.length];

  return {
    ...weather,
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 m/s
    feelsLike: weather.temperature + Math.floor(Math.random() * 5) - 2 // ±2 grados
  };
};
```

## Mapeo de Coordenadas para Chile

Debes crear un mapeo de comunas chilenas a coordenadas:

```javascript
const CHILE_COORDINATES = {
  'Región Metropolitana': {
    'Santiago': { lat: -33.4475, lng: -70.6737 },
    'Puente Alto': { lat: -33.5926, lng: -70.5804 },
    'La Florida': { lat: -33.5125, lng: -70.5886 },
    'Maipú': { lat: -33.5064, lng: -70.7825 },
    'San Bernardo': { lat: -33.5929, lng: -70.7077 }
  },
  'Región del Valparaíso': {
    'Valparaíso': { lat: -33.0458, lng: -71.6204 },
    'Viña del Mar': { lat: -32.9516, lng: -71.5455 },
    'Quilpué': { lat: -33.0474, lng: -71.6887 },
    'Villa Alemana': { lat: -33.0333, lng: -71.6333 }
  },
  'Región del Biobío': {
    'Concepción': { lat: -36.8201, lng: -73.0444 },
    'Talcahuano': { lat: -36.7261, lng: -73.1169 },
    'Chillán': { lat: -36.6069, lng: -72.1034 }
  },
  'Región de Los Lagos': {
    'Puerto Montt': { lat: -41.4693, lng: -72.9421 },
    'Puerto Varas': { lat: -41.3167, lng: -72.9667 }
  },
  // Agregar más regiones y comunas según necesites
};

const getCoordinatesForComuna = (comuna, region) => {
  return CHILE_COORDINATES[region]?.[comuna] || CHILE_COORDINATES['Región Metropolitana']['Santiago'];
};
```

## Mapeo de Condiciones Climáticas

```javascript
const mapWeatherCondition = (apiCondition) => {
  const conditionMap = {
    'Clear': 'Soleado',
    'Clouds': 'Nublado',
    'Rain': 'Lluvioso',
    'Drizzle': 'Lluvioso',
    'Snow': 'Nevado',
    'Mist': 'Nublado',
    'Fog': 'Nublado',
    'Wind': 'Ventoso'
  };

  return conditionMap[apiCondition] || 'Soleado';
};

const getRecommendation = (temperature, condition) => {
  if (temperature < 10) {
    return 'Necesitas abrigo grueso y gorro';
  } else if (temperature < 15) {
    return 'Perfecto para prendas de invierno';
  } else if (temperature < 20) {
    return 'Ideal para prendas informales cómodas';
  } else if (temperature > 25) {
    return 'Perfecto para prendas ligeras de verano';
  } else {
    return 'Buen día para prendas versátiles';
  }
};
```

## Configuración del Servidor

### Variables de Entorno Necesarias
```
OPENWEATHER_API_KEY=tu_api_key_aqui
WEATHERAPI_KEY=tu_api_key_aqui
PORT=3000
```

### Ejemplo Completo con Express

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Endpoint principal del clima
app.get('/api/weather', async (req, res) => {
  try {
    const { region, comuna } = req.query;

    if (!region || !comuna) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren region y comuna'
      });
    }

    const weatherData = await getWeatherFromAPI(comuna, region);
    
    res.json({
      success: true,
      ...weatherData
    });
  } catch (error) {
    console.error('Error en /api/weather:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo datos del clima'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## Configuración en la App

No olvides actualizar la URL en `services/weatherService.ts`:

```typescript
const API_BASE_URL = 'https://tu-backend.com/api'; // Tu URL real
```

## Testing

Puedes probar los endpoints con curl:

```bash
# Health check
curl https://tu-backend.com/api/health

# Clima para Santiago
curl "https://tu-backend.com/api/weather?region=Región Metropolitana&comuna=Santiago"

# Clima para Valparaíso
curl "https://tu-backend.com/api/weather?region=Región del Valparaíso&comuna=Valparaíso"
```

## Consideraciones Adicionales

- **Rate Limiting**: Implementa límites de tasa para evitar abuso de la API
- **Caching**: Cachea los resultados por 30 minutos para reducir llamadas a APIs de terceros
- **Error Handling Maneja errores de forma graciosa y retorna datos simulados como fallback
- **Logging**: Implementa logging para monitorear el uso y errores
- **Security**: Valida y sanitiza los parámetros de entrada

Con esta configuración, tu app "¿Qué me pongo?" podrá mostrar clima real basado en la ubicación del usuario y dar recomendaciones de prendas más precisas.
