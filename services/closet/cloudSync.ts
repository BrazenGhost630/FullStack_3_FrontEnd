import { Prenda } from '../../components/useClosetStore';
import { getToken } from '../authService';
import { uploadImageToSync, exportToCloud, downloadFromCloud, deleteFromCloud } from '../syncService';

export interface CloudSyncResult {
  success: boolean;
  cloudImageUri?: string;
  error?: string;
}

/**
 * Sube una imagen al servicio de sincronización
 * @param localUri URI local de la imagen
 * @returns URL de la imagen en la nube o error
 */
export const uploadImageToCloud = async (localUri: string): Promise<CloudSyncResult> => {
  try {
    const cloudImageUri = await uploadImageToSync(localUri);
    return {
      success: true,
      cloudImageUri: cloudImageUri,
    };
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

    // 2. Actualizar la prenda con la URL de la imagen en la nube
    return {
      success: true,
      cloudImageUri: cloudImageUri || undefined,
    };
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
    const token = await getToken();
    return token !== null;
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
    const cloudWardrobe = await downloadFromCloud();
    
    if (cloudWardrobe && cloudWardrobe.items) {
      return cloudWardrobe.items.map((item: any) => ({
        id: parseInt(item.id),
        name: item.name,
        type: item.type as any,
        season: item.season as any,
        style: item.style as any,
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
 * Exporta todas las prendas locales a la nube
 * @param localPrendas Array de prendas locales
 * @returns Resultado de la exportación
 */
export const syncAllToCloud = async (localPrendas: Prenda[]): Promise<CloudSyncResult> => {
  try {
    // Verificar conexión a internet
    const hasConnection = await checkInternetConnection();
    if (!hasConnection) {
      return {
        success: false,
        error: 'No hay conexión a internet',
      };
    }

    // Primero subir imágenes pendientes
    for (const prenda of localPrendas) {
      if (prenda.imageUri && !prenda.cloudImageUri && prenda.syncStatus === 'pending') {
        const imageResult = await uploadImageToCloud(prenda.imageUri);
        if (imageResult.success && imageResult.cloudImageUri) {
          prenda.cloudImageUri = imageResult.cloudImageUri;
        }
      }
    }

    // Exportar todas las prendas a la nube
    await exportToCloud(localPrendas);
    
    console.log(`Exportadas ${localPrendas.length} prendas a la nube`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error exportando a la nube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Elimina una prenda de la nube
 * @param itemId ID de la prenda a eliminar
 * @returns Resultado de la eliminación
 */
export const deleteGarmentFromCloud = async (itemId: string): Promise<CloudSyncResult> => {
  try {
    await deleteFromCloud(itemId);
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error eliminando de la nube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
