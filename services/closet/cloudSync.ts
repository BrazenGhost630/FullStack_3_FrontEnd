import axios from 'axios';
import { Prenda } from '../../components/useClosetStore';
import { getToken } from '../authService';
import { AUTH_API_URL } from '../apiConfig';


// TODO: Configurar la URL del servicio de almacenamiento de imágenes
const STORAGE_BASE_URL = 'https://tu-storage.com';

export interface CloudSyncResult {
  success: boolean;
  cloudImageUri?: string;
  error?: string;
}

/**
 * Sube una imagen al servicio de almacenamiento en la nube
 * @param localUri URI local de la imagen
 * @returns URL de la imagen en la nube o error
 */
export const uploadImageToCloud = async (localUri: string): Promise<CloudSyncResult> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Usuario no autenticado.' };
    }

    // Crear FormData para subir la imagen
    const formData = new FormData();
    formData.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: `garment_${Date.now()}.jpg`,
    } as any);

    // Subir imagen al storage
    const response = await axios.post(`${STORAGE_BASE_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 segundos timeout
    });

    if (response.data && response.data.url) {
      return {
        success: true,
        cloudImageUri: response.data.url,
      };
    } else {
      return {
        success: false,
        error: 'Respuesta inválida del servidor de imágenes',
      };
    }
  } catch (error) {
    console.error('Error subiendo imagen a la nube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Sincroniza una prenda con la nube
 * @param prenda Datos de la prenda a sincronizar
 * @returns Resultado de la sincronización
 */
export const syncGarmentToCloud = async (prenda: Prenda): Promise<CloudSyncResult> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Usuario no autenticado.' };
    }

    // 1. Subir imagen si existe y no está en la nube
    let cloudImageUri = prenda.cloudImageUri;
    
    if (prenda.imageUri && !cloudImageUri) {
      const imageResult = await uploadImageToCloud(prenda.imageUri);
      if (!imageResult.success) {
        return {
          success: false,
          error: `Error subiendo imagen: ${imageResult.error}`,
        };
      }
      cloudImageUri = imageResult.cloudImageUri;
    }

    // 2. Enviar datos de la prenda al backend
    const garmentData = {
      id: prenda.id,
      name: prenda.name,
      type: prenda.type,
      season: prenda.season,
      style: prenda.style,
      imageUri: cloudImageUri || undefined,
      primaryColor: prenda.primaryColor,
      secondaryColor: prenda.secondaryColor,
    };

    const response = await axios.post(`${AUTH_API_URL}/garments`, garmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000, // 15 segundos timeout
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        cloudImageUri: cloudImageUri || undefined,
      };
    } else {
      return {
        success: false,
        error: 'Error guardando datos de la prenda',
      };
    }
  } catch (error) {
    console.error('Error sincronizando prenda:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Verifica la conexión a internet
 * @returns true si hay conexión, false si no
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  // Esta función puede no requerir autenticación, dependiendo del backend.
  try {
    const token = await getToken();
    const response = await axios.get(`${AUTH_API_URL}/health`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 5000, // 5 segundos timeout
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene prendas sincronizadas desde la nube
 * @returns Array de prendas desde la nube
 */
export const getGarmentsFromCloud = async (): Promise<Prenda[]> => {
  try {
    const token = await getToken();
    if (!token) {
      console.error('No se encontró token para obtener prendas de la nube.');
      return [];
    }

    const response = await axios.get(`${AUTH_API_URL}/garments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        season: item.season,
        style: item.style,
        imageUri: null, // No guardamos imágenes locales desde la nube
        cloudImageUri: item.imageUri,
        syncStatus: 'synced' as const,
        primaryColor: item.primaryColor,
        secondaryColor: item.secondaryColor,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo prendas de la nube:', error);
    return [];
  }
};

/**
 * Sincroniza datos desde la nube a la base de datos local
 * @returns Resultado de la sincronización
 */
export const syncFromCloud = async (): Promise<CloudSyncResult> => {
  try {
    // Verificar conexión a internet
    const hasConnection = await checkInternetConnection();
    if (!hasConnection) {
      return {
        success: false,
        error: 'No hay conexión a internet',
      };
    }

    // Obtener prendas desde la nube
    const cloudGarments = await getGarmentsFromCloud();
    
    // Importar a la base de datos local
    // TODO: Implementar la lógica para guardar en la base de datos local
    // Esto requeriría acceso a la función de base de datos local
    
    console.log(`Sincronizados ${cloudGarments.length} prendas desde la nube`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sincronizando desde la nube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
