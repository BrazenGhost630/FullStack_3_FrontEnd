import { Platform } from 'react-native';

// --- IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora en tu red Wi-Fi.
// La IP '10.0.2.2' solo funciona para emuladores de Android, no para teléfonos físicos.
// Puedes encontrar tu IP en Windows con 'ipconfig' o en Mac/Linux con 'ifconfig'.
const MI_COMPUTADORA_IP = '10.70.10.155'; // ¡ÚNICO LUGAR PARA CAMBIAR LA IP!

// URL para el servicio de autenticación y prendas (puerto 8080)
const AUTH_API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:8080/api" : `http://${MI_COMPUTADORA_IP}:8080/api`);

// URL para el servicio de clima (puerto 8082)
const WEATHER_API_URL = process.env.EXPO_PUBLIC_WEATHER_API_URL || (Platform.OS === "web" ? "http://localhost:8082/api" : `http://${MI_COMPUTADORA_IP}:8082/api`);

// URL para el servicio de sincronización (puerto 8083)
const SYNC_API_URL = process.env.EXPO_PUBLIC_SYNC_API_URL || (Platform.OS === "web" ? "http://localhost:8083/api/v1/sync" : `http://${MI_COMPUTADORA_IP}:8083/api/v1/sync`);

export { AUTH_API_URL, WEATHER_API_URL, SYNC_API_URL };