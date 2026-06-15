# Instrucciones para Implementar Endpoints de Sincronización en el BFF

## Contexto
El BFF (Backend For Frontend) actualmente corre en el puerto 8085 y necesita redirigir las solicitudes de sincronización al microservicio de sincronización que corre en el puerto 8083.

## Endpoints Requeridos

### 1. POST /api/export
**Descripción:** Exporta prendas locales a la nube

**Redirección:** `http://192.168.1.11:8083/api/v1/sync/export`

**Nota importante:** El microservicio de sincronización tiene `@RequestMapping("/api/v1/sync")` y `@PostMapping("/export")`, por lo que el endpoint completo es `/api/v1/sync/export`.

**Headers requeridos:**
- `Authorization: Bearer {token}`

**Body:** Array de prendas en formato JSON
```json
[
  {
    "id": "1",
    "name": "Polera Roja",
    "type": "Polera",
    "season": "Verano",
    "style": "Informal",
    "imageUri": "https://...",
    "primaryColor": "#FF0000",
    "secondaryColor": "#FFFFFF",
    "syncStatus": "pending",
    "updatedAt": "2024-06-14T20:00:00.000Z"
  }
]
```

**Implementación:**
```javascript
app.post('/api/export', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const prendas = req.body;
    
    const response = await axios.post('http://192.168.1.11:8083/api/v1/sync/export', prendas, {
      headers: {
        Authorization: token
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
```

---

### 2. GET /api/download
**Descripción:** Descarga prendas desde la nube

**Redirección:** `http://192.168.1.11:8083/api/v1/sync/download`

**Nota importante:** El microservicio de sincronización tiene `@RequestMapping("/api/v1/sync")` y `@GetMapping("/download")`, por lo que el endpoint completo es `/api/v1/sync/download`.

**Headers requeridos:**
- `Authorization: Bearer {token}`

**Implementación:**
```javascript
app.get('/api/download', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    const response = await axios.get('http://192.168.1.11:8083/api/v1/sync/download', {
      headers: {
        Authorization: token
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
```

---

### 3. DELETE /api/item/:id
**Descripción:** Elimina una prenda de la nube

**Redirección:** `http://192.168.1.11:8083/api/v1/sync/item/:id`

**Nota importante:** El microservicio de sincronización tiene `@RequestMapping("/api/v1/sync")` y `@DeleteMapping("/item/{id}")`, por lo que el endpoint completo es `/api/v1/sync/item/{id}`.

**Headers requeridos:**
- `Authorization: Bearer {token}`

**Parámetros:**
- `id`: ID de la prenda a eliminar

**Implementación:**
```javascript
app.delete('/api/item/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const itemId = req.params.id;
    
    await axios.delete(`http://192.168.1.11:8083/api/v1/sync/item/${itemId}`, {
      headers: {
        Authorization: token
      }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
```

---

### 4. POST /api/upload-image
**Descripción:** Sube una imagen al microservicio de sincronización

**Redirección:** `http://192.168.1.11:8083/api/v1/sync/upload-image`

**Nota importante:** El microservicio de sincronización tiene `@RequestMapping("/api/v1/sync")` y `@PostMapping("/upload-image")`, por lo que el endpoint completo es `/api/v1/sync/upload-image`.

**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:** FormData con la imagen
```
image: (file)
```

**Implementación:**
```javascript
app.post('/api/upload-image', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    const formData = new FormData();
    formData.append('image', req.file);
    
    const response = await axios.post('http://192.168.1.11:8083/api/v1/sync/upload-image', formData, {
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
```

---

## Configuración de IP

La IP del microservicio de sincronización es: `192.168.1.11:8083`

Esta IP está configurada en el archivo `services/apiConfig.ts` del frontend. Si cambias esta IP, debes actualizarla también en el frontend.

---

## Notas Importantes

1. **Autenticación:** Todos los endpoints requieren un token JWT en el header `Authorization`. El BFF debe pasar este token al microservicio de sincronización.

2. **Error Handling:** El BFF debe manejar errores del microservicio y devolverlos al cliente con el código de estado apropiado.

3. **Timeout:** Considera agregar timeouts a las solicitudes al microservicio para evitar que el BFF se cuelgue si el microservicio no responde.

4. **Logging:** Agrega logging para depurar problemas de comunicación entre el BFF y el microservicio.

5. **CORS:** Si el BFF y el frontend están en diferentes dominios, asegúrate de configurar CORS correctamente.

---

## Verificación

Después de implementar estos endpoints:

1. Reinicia el BFF
2. En el frontend, cambia `SYNC_API_URL` en `services/apiConfig.ts` de `SYNC_API_URL_DIRECT` a `BFF_API_URL`
3. Prueba la sincronización desde la app móvil
4. Verifica los logs del BFF para confirmar que las solicitudes se están redirigiendo correctamente

---

## Archivo de Configuración del Frontend

Después de implementar los endpoints en el BFF, actualiza `services/apiConfig.ts`:

```typescript
// Cambia esta línea:
let SYNC_API_URL = SYNC_API_URL_DIRECT;

// Por esta:
let SYNC_API_URL = BFF_API_URL;
```

Esto hará que todas las solicitudes de sincronización pasen por el BFF en lugar de ir directamente al microservicio.
