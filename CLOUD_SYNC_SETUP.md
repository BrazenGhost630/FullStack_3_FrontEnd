# Configuración de Sincronización en la Nube - ¿Qué me pongo?

## Overview

La app ahora está configurada para sincronización local-first con la nube. Las prendas se guardan localmente primero y se sincronizan cuando el usuario presiona el botón "Sincronizar con la Nube".

## Cambios Implementados

### 1. Estructura de Datos
- **Interfaz Prenda actualizada**: Incluye `cloudImageUri`, `syncStatus`
- **Base de datos SQLite**: Nuevos campos para sincronización
- **Estados de sincronización**: `pending`, `synced`, `error`

### 2. Funcionalidad
- **Guardado local inmediato**: Las prendas se guardan en SQLite al instante
- **Botón de sincronización**: Sube prendas pendientes a la nube
- **Indicadores visuales**: Muestra estado de sincronización en cada prenda
- **Manejo de errores**: Marca prendas con errores de sincronización

### 3. UI Nueva
- **Botón "☁️ Sincronizar con la Nube"**: En pantalla principal
- **Estado de sincronización**: ⏳ Pendiente, ✅ Sincronizado, ❌ Error
- **Contador de estados**: Muestra cuántas prendas están en cada estado
- **Loading indicator**: Durante proceso de sincronización

## Configuración del Backend

### Paso 1: Configurar URLs del Servicio

Edita `services/cloudSync.ts` y reemplaza las URLs:

```typescript
const API_BASE_URL = 'https://tu-backend.com/api';  // Tu backend
const STORAGE_BASE_URL = 'https://tu-storage.com';  // Tu servicio de imágenes
```

### Paso 2: Backend API Endpoints

Tu backend debe tener estos endpoints:

#### POST `/api/health`
```javascript
// Verifica conexión
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

#### POST `/api/garments`
```javascript
// Guarda datos de prenda
app.post('/api/garments', upload.none(), async (req, res) => {
  const { id, name, type, season, style, imageUri, primaryColor, secondaryColor } = req.body;
  
  try {
    // Guardar en tu base de datos
    await saveGarment({ id, name, type, season, style, imageUri, primaryColor, secondaryColor });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### GET `/api/garments`
```javascript
// Obtiene todas las prendas sincronizadas
app.get('/api/garments', async (req, res) => {
  try {
    const garments = await getAllGarments();
    res.json(garments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Paso 3: Servicio de Almacenamiento de Imágenes

#### POST `/upload` (Ejemplo con Node.js + Multer)
```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    
    // Subir a tu servicio (AWS S3, Cloudinary, etc.)
    const imageUrl = await uploadToCloudStorage(buffer, originalname);
    
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Opciones de Servicios

### Opción 1: Firebase
- **Firestore**: Para datos de prendas
- **Firebase Storage**: Para imágenes
- **Configuración**: Reemplazar URLs con las de tu proyecto Firebase

### Opción 2: AWS
- **RDS/DynamoDB**: Para datos
- **S3**: Para imágenes
- **API Gateway**: Para endpoints

### Opción 3: Supabase
- **PostgreSQL**: Para datos
- **Supabase Storage**: Para imágenes
- **Auto-generated API**: Endpoints automáticos

## Flujo de Sincronización

1. **Usuario agrega prenda** → Se guarda en SQLite con `syncStatus: 'pending'`
2. **Usuario presiona sincronizar** → App verifica conexión
3. **Sube imágenes** → Si tiene `imageUri` local, sube a storage
4. **Guarda datos** → Envía prenda con `cloudImageUri` al backend
5. **Actualiza estado** → Cambia `syncStatus` a `'synced'` o `'error'`

## Manejo de Errores

- **Sin conexión**: Botón deshabilitado, muestra mensaje
- **Error de subida**: Marca prenda como `'error'`, permite reintentar
- **Timeout**: 30 segundos para imágenes, 15 para datos

## Testing

1. **Test offline**: Agrega prendas sin internet
2. **Test sincronización**: Conecta y presiona botón
3. **Test errores**: Simula fallos de red
4. **Test reintentos**: Prendas con error deben poder sincronizarse nuevamente

## Consideraciones Adicionales

- **Autenticación**: Agregar user_id a las prendas para multiusuario
- **Conflict resolution**: Manejar si la misma prenda se modifica en múltiples dispositivos
- **Batch sync**: Optimizar para muchas prendas pendientes
- **Background sync**: Opcionalmente sincronizar automáticamente cuando hay conexión

## Resumen

La implementación está completa y lista para conectar con tu backend. Solo necesitas:
1. Configurar las URLs en `cloudSync.ts`
2. Implementar los endpoints del backend
3. Configurar el servicio de almacenamiento de imágenes
4. Probar el flujo completo

La app funcionará perfectamente offline y sincronizará cuando el usuario lo decida.
