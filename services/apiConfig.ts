import { Platform } from 'react-native';

// --- IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora en tu red Wi-Fi.
// La IP '10.0.2.2' solo funciona para emuladores de Android, no para teléfonos físicos.
// Puedes encontrar tu IP en Windows con 'ipconfig' o en Mac/Linux con 'ifconfig'.
const MI_COMPUTADORA_IP = '192.168.1.11'; // ¡ÚNICO LUGAR PARA CAMBIAR LA IP!

// URL para el BFF (Backend For Frontend) - puerto 8085
// El BFF redirige las peticiones a los microservicios correspondientes
const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL || (Platform.OS === "web" ? "http://localhost:8085/api" : `http://${MI_COMPUTADORA_IP}:8085/api`);

// URLs para los microservicios individuales (fallback)
const AUTH_API_URL_DIRECT = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:8080/api" : `http://${MI_COMPUTADORA_IP}:8080/api`);
const WEATHER_API_URL_DIRECT = process.env.EXPO_PUBLIC_WEATHER_API_URL || (Platform.OS === "web" ? "http://localhost:8082/api" : `http://${MI_COMPUTADORA_IP}:8082/api`);
const SYNC_API_URL_DIRECT = process.env.EXPO_PUBLIC_SYNC_API_URL || (Platform.OS === "web" ? "http://localhost:8083/api/v1/sync" : `http://${MI_COMPUTADORA_IP}:8083/api/v1/sync`);

// URLs para usar (por defecto BFF, pero se puede cambiar a directo si es necesario)
let AUTH_API_URL = BFF_API_URL;
let WEATHER_API_URL = BFF_API_URL;
let SYNC_API_URL = BFF_API_URL;

/**
 * Cambia entre modo BFF y modo microservicios directos
 * @param useBFF Si true usa BFF, si false usa microservicios directos
 */
export const setAPIMode = (useBFF: boolean) => {
  if (useBFF) {
    AUTH_API_URL = BFF_API_URL;
    WEATHER_API_URL = BFF_API_URL;
    SYNC_API_URL = BFF_API_URL;
  } else {
    AUTH_API_URL = AUTH_API_URL_DIRECT;
    WEATHER_API_URL = WEATHER_API_URL_DIRECT;
    SYNC_API_URL = SYNC_API_URL_DIRECT;
  }
};

/**
 * Obtiene las URLs actuales
 */
export const getAPIUrls = () => ({
  AUTH_API_URL,
  WEATHER_API_URL,
  SYNC_API_URL,
  BFF_API_URL,
});

/**
 * Verifica si el BFF está disponible y cambia al modo apropiado
 * @param timeout Tiempo de espera en ms (default 3000)
 */
export const checkBFFAvailability = async (timeout: number = 3000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    await fetch(BFF_API_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    // Si responde (aunque sea error), asumimos que está disponible
    setAPIMode(true);
    return true;
  } catch (error) {
    console.log('BFF no disponible, usando microservicios directos');
    setAPIMode(false);
    return false;
  }
};

export { AUTH_API_URL, BFF_API_URL, SYNC_API_URL, WEATHER_API_URL };

