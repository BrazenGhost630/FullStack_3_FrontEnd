import axios from 'axios';
import { Prenda } from '../../components/useClosetStore';

// Configuración - reemplazar con URLs reales de tu backend
const API_BASE_URL = 'https://tu-api.com/api';
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

    const response = await axios.post(`${API_BASE_URL}/garments`, garmentData, {
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
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
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
    const response = await axios.get(`${API_BASE_URL}/garments`, {
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
export const syncFromCloud = async (): Promise<{ success: boolean; error?: string; data?: Prenda[] }> => {
  try {
    // Verificar conexión a internet
    const hasConnection = await checkInternetConnection();
    if (!hasConnection) {
      return {
        success: false,
        error: 'No hay conexión a Internet',
      };
    }

    // Obtener prendas desde la nube
    const cloudGarments = await getGarmentsFromCloud();
    
    // Si la API falla silenciosamente y devuelve un array vacío, podría ser un error
    if (!cloudGarments) {
        return { success: false, error: 'La respuesta de la API no fue válida.' };
    }

    console.log(`Se obtuvieron ${cloudGarments.length} prendas desde la nube.`);
    
    return {
      success: true,
      data: cloudGarments,
    };
  } catch (error) {
    console.error('Error sincronizando desde la nube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
