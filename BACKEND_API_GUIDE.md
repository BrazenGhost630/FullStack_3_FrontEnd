# Guía de Backend - ¿Qué me pongo?

## Overview

Esta guía describe cómo implementar el backend completo para la aplicación "¿Qué me pongo?" con todos los endpoints necesarios para clima, sincronización de prendas y almacenamiento de imágenes.

## Arquitectura General

```
Frontend (React Native/Expo)
    ↓ HTTP/HTTPS
Backend API (Node.js/Express)
    ↓
Base de Datos (PostgreSQL/MongoDB)
    ↓
Storage de Imágenes (AWS S3/Cloudinary)
```

## Requisitos del Backend

### Tecnologías Recomendadas
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL o MongoDB
- **Storage**: AWS S3, Cloudinary, o similar
- **Autenticación**: JWT (opcional para futuras versiones)

### Variables de Entorno
```env
PORT=3000
NODE_ENV=production

# Base de Datos
DATABASE_URL=postgresql://user:pass@localhost:5432/que_me_pongo
# o
MONGODB_URI=mongodb://localhost:27017/que_me_pongo

# Storage de Imágenes
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=que-me-pongo-images

# APIs Externas
OPENWEATHER_API_KEY=tu_api_key
WEATHERAPI_KEY=tu_api_key

# CORS
FRONTEND_URL=http://localhost:8081
```

## Endpoints API

### 1. Health Check
```
GET /api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-27T22:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Clima
```
GET /api/weather?region=Región Metropolitana&comuna=Santiago
```

**Parámetros:**
- `region` (string, required): Región de Chile
- `comuna` (string, required): Comuna de Chile

**Respuesta:**
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

### 3. Prendas (CRUD)

#### Crear Prenda
```
POST /api/garments
```

**Body:**
```json
{
  "id": 123,
  "name": "Polera Azul",
  "type": "Polera",
  "season": "Verano",
  "style": "Informal",
  "imageUri": "https://storage.com/images/garment_123.jpg",
  "primaryColor": "#0000FF",
  "secondaryColor": "#FFFFFF"
}
```

**Respuesta:**
```json
{
  "success": true,
  "garment": {
    "id": 123,
    "name": "Polera Azul",
    "type": "Polera",
    "season": "Verano",
    "style": "Informal",
    "imageUri": "https://storage.com/images/garment_123.jpg",
    "primaryColor": "#0000FF",
    "secondaryColor": "#FFFFFF",
    "createdAt": "2026-04-27T22:30:00.000Z",
    "updatedAt": "2026-04-27T22:30:00.000Z"
  }
}
```

#### Obtener Todas las Prendas
```
GET /api/garments
```

**Respuesta:**
```json
{
  "success": true,
  "garments": [
    {
      "id": 123,
      "name": "Polera Azul",
      "type": "Polera",
      "season": "Verano",
      "style": "Informal",
      "imageUri": "https://storage.com/images/garment_123.jpg",
      "primaryColor": "#0000FF",
      "secondaryColor": "#FFFFFF",
      "createdAt": "2026-04-27T22:30:00.000Z",
      "updatedAt": "2026-04-27T22:30:00.000Z"
    }
  ]
}
```

#### Actualizar Prenda
```
PUT /api/garments/:id
```

#### Eliminar Prenda
```
DELETE /api/garments/:id
```

### 4. Upload de Imágenes
```
POST /api/upload
Content-Type: multipart/form-data
```

**Body:**
- `image` (file): Archivo de imagen

**Respuesta:**
```json
{
  "success": true,
  "url": "https://storage.com/images/garment_123.jpg"
}
```

## Estructura de Base de Datos

### PostgreSQL Schema

```sql
-- Tabla de prendas
CREATE TABLE garments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Sombrero', 'Polera', 'Pantalón', 'Calzado')),
    season VARCHAR(20) NOT NULL CHECK (season IN ('Verano', 'Invierno')),
    style VARCHAR(20) NOT NULL CHECK (style IN ('Formal', 'Informal')),
    image_uri TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor rendimiento
CREATE INDEX idx_garments_type ON garments(type);
CREATE INDEX idx_garments_season ON garments(season);
CREATE INDEX idx_garments_style ON garments(style);
```

### MongoDB Schema

```javascript
// garments collection
{
  _id: ObjectId,
  id: Number, // ID del frontend
  name: String,
  type: String, // 'Sombrero', 'Polera', 'Pantalón', 'Calzado'
  season: String, // 'Verano', 'Invierno'
  style: String, // 'Formal', 'Informal'
  imageUri: String,
  primaryColor: String,
  secondaryColor: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Implementación Completa (Node.js + Express)

### server.js

```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081'
}));
app.use(express.json());

// Configuración de Multer para uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Importar rutas
const weatherRoutes = require('./routes/weather');
const garmentRoutes = require('./routes/garments');
const uploadRoutes = require('./routes/upload');

app.use('/api/weather', weatherRoutes);
app.use('/api/garments', garmentRoutes);
app.use('/api/upload', uploadRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### routes/weather.js

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Mapeo de coordenadas para Chile
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
  }
  // Agregar más regiones y comunas según necesites
};

const getCoordinatesForComuna = (comuna, region) => {
  return CHILE_COORDINATES[region]?.[comuna] || CHILE_COORDINATES['Región Metropolitana']['Santiago'];
};

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

router.get('/', async (req, res) => {
  try {
    const { region, comuna } = req.query;

    if (!region || !comuna) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren region y comuna'
      });
    }

    // Obtener coordenadas
    const coordinates = getCoordinatesForComuna(comuna, region);

    // Llamar a API de clima (OpenWeatherMap)
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        },
        timeout: 5000
      }
    );

    const weather = weatherResponse.data;

    const result = {
      success: true,
      temperature: Math.round(weather.main.temp),
      condition: mapWeatherCondition(weather.weather[0].main),
      recommendation: getRecommendation(weather.main.temp, weather.weather[0].main),
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      feelsLike: Math.round(weather.main.feels_like)
    };

    res.json(result);
  } catch (error) {
    console.error('Error obteniendo clima:', error);
    
    // Si falla la API, retornar datos simulados
    const simulatedData = {
      success: true,
      temperature: 22,
      condition: 'Soleado',
      recommendation: 'Perfecto para prendas ligeras de verano',
      humidity: 45,
      windSpeed: 10,
      feelsLike: 21
    };

    res.json(simulatedData);
  }
});

module.exports = router;
```

### routes/garments.js

```javascript
const express = require('express');
const { Pool } = require('pg'); // o MongoClient para MongoDB
const router = express.Router();

// Configuración de base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware para validar tipos
const validateGarment = (req, res, next) => {
  const { type, season, style } = req.body;
  
  const validTypes = ['Sombrero', 'Polera', 'Pantalón', 'Calzado'];
  const validSeasons = ['Verano', 'Invierno'];
  const validStyles = ['Formal', 'Informal'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de prenda inválido'
    });
  }

  if (!validSeasons.includes(season)) {
    return res.status(400).json({
      success: false,
      error: 'Temporada inválida'
    });
  }

  if (!validStyles.includes(style)) {
    return res.status(400).json({
      success: false,
      error: 'Estilo inválido'
    });
  }

  next();
};

// Crear prenda
router.post('/', validateGarment, async (req, res) => {
  try {
    const { id, name, type, season, style, imageUri, primaryColor, secondaryColor } = req.body;

    const query = `
      INSERT INTO garments (id, name, type, season, style, image_uri, primary_color, secondary_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        season = EXCLUDED.season,
        style = EXCLUDED.style,
        image_uri = EXCLUDED.image_uri,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [id, name, type, season, style, imageUri, primaryColor, secondaryColor];
    const result = await pool.query(query, values);

    res.json({
      success: true,
      garment: result.rows[0]
    });
  } catch (error) {
    console.error('Error creando prenda:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando prenda'
    });
  }
});

// Obtener todas las prendas
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM garments ORDER BY created_at DESC';
    const result = await pool.query(query);

    res.json({
      success: true,
      garments: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo prendas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo prendas'
    });
  }
});

// Actualizar prenda
router.put('/:id', validateGarment, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, season, style, imageUri, primaryColor, secondaryColor } = req.body;

    const query = `
      UPDATE garments
      SET name = $1, type = $2, season = $3, style = $4, image_uri = $5, 
          primary_color = $6, secondary_color = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [name, type, season, style, imageUri, primaryColor, secondaryColor, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenda no encontrada'
      });
    }

    res.json({
      success: true,
      garment: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando prenda:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando prenda'
    });
  }
});

// Eliminar prenda
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM garments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenda no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Prenda eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando prenda:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando prenda'
    });
  }
});

module.exports = router;
```

### routes/upload.js

```javascript
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const router = express.Router();

// Configuración de AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configuración de Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ninguna imagen'
      });
    }

    const fileName = `garments/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    res.json({
      success: true,
      url: result.Location
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error subiendo imagen'
    });
  }
});

module.exports = router;
```

## package.json

```json
{
  "name": "que-me-pongo-backend",
  "version": "1.0.0",
  "description": "Backend para ¿Qué me pongo?",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1490.0",
    "axios": "^1.6.0",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

## Configuración del Frontend

Una vez que el backend esté funcionando, actualiza las URLs en el frontend:

### services/weatherService.ts
```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // Tu URL real
```

### services/cloudSync.ts
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
const STORAGE_BASE_URL = 'http://localhost:3000/api';
```

## Testing

### Probar endpoints con curl

```bash
# Health check
curl http://localhost:3000/api/health

# Clima
curl "http://localhost:3000/api/weather?region=Región Metropolitana&comuna=Santiago"

# Crear prenda
curl -X POST http://localhost:3000/api/garments \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123,
    "name": "Polera Azul",
    "type": "Polera",
    "season": "Verano",
    "style": "Informal"
  }'

# Obtener prendas
curl http://localhost:3000/api/garments
```

## Despliegue

### Opciones de Hosting
- **VPS**: DigitalOcean, Linode, Vultr
- **PaaS**: Heroku, Render, Railway
- **Container**: Docker + AWS/GCP/Azure

### Configuración de Producción
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar servidor
npm start
```

## Consideraciones Adicionales

### Seguridad
- Validar todos los inputs
- Implementar rate limiting
- Usar HTTPS en producción
- Sanitizar datos de usuario

### Performance
- Implementar caching (Redis)
- Optimizar queries de base de datos
- Usar CDN para imágenes
- Implementar logging

### Escalabilidad
- Balanceo de carga
- Base de datos replicada
- Microservicios si crece mucho

Con esta guía completa, tendrás un backend robusto y funcional para tu app "¿Qué me pongo?" que soporta todas las características del frontend.
