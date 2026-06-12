import { Platform } from 'react-native';

// --- IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora en tu red Wi-Fi.
// La IP '10.0.2.2' solo funciona para emuladores de Android, no para teléfonos físicos.
// Puedes encontrar tu IP en Windows con 'ipconfig' o en Mac/Linux con 'ifconfig'.
const MI_COMPUTADORA_IP = '10.70.10.155'; // ¡ÚNICO LUGAR PARA CAMBIAR LA IP!

// URL para el BFF (Backend For Frontend) - puerto 8085
// El BFF redirige las peticiones a los microservicios correspondientes
const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL || (Platform.OS === "web" ? "http://localhost:8085/api" : `http://${MI_COMPUTADORA_IP}:8085/api`);

// URL para el servicio de autenticación y prendas (ahora a través del BFF)
const AUTH_API_URL = BFF_API_URL;

// URL para el servicio de clima (ahora a través del BFF)
const WEATHER_API_URL = BFF_API_URL;

// URL para el servicio de sincronización (ahora a través del BFF)
const SYNC_API_URL = BFF_API_URL + "/v1/sync";

export { AUTH_API_URL, WEATHER_API_URL, SYNC_API_URL, BFF_API_URL };