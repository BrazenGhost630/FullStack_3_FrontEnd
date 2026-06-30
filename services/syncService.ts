import axios from 'axios';
import { Prenda } from '../components/useClosetStore';
import { SYNC_API_URL } from './apiConfig';
import { getToken } from './authService';

export interface CloudClothingItem {
  id: string;
  name: string;
  type: string;
  season: string;
  style: string;
  imageUri?: string;
  primaryColor?: string;
  secondaryColor?: string;
  syncStatus: string;
  updatedAt: string;
}

export interface CloudWardrobe {
  id: string;
  userId: string;
  lastSync: string;
  items: CloudClothingItem[];
}

/**
 * Sube una imagen al MS Sync
 */
export const uploadImageToSync = async (localUri: string): Promise<string> => {
  console.log('=== SUBIENDO IMAGEN A LA NUBE ===');
  console.log('Local URI:', localUri);
  console.log('SYNC_API_URL:', SYNC_API_URL);

  try {
    const token = await getToken();
    if (!token) {
      console.error('Usuario no autenticado para subir imagen');
      throw new Error('Usuario no autenticado.');
    }

    console.log('Token obtenido:', token ? 'Sí' : 'No');

    const formData = new FormData();
    formData.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: `garment_${Date.now()}.jpg`,
    } as any);

    const url = `${SYNC_API_URL}/v1/sync/upload-image`;
    console.log('Haciendo upload a:', url);

    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    console.log('Respuesta status:', response.status);
    console.log('Respuesta data:', response.data);

    if (response.data && response.data.url) {
      console.log('Imagen subida exitosamente:', response.data.url);
      return response.data.url;
    } else {
      console.error('Respuesta inválida del servidor:', response.data);
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error - Status:', error.response?.status);
      console.error('Axios error - Data:', error.response?.data);
      console.error('Axios error - Message:', error.message);
    }
    throw error;
  }
};

/**
 * Exporta prendas a la nube
 */
export const exportToCloud = async (localPrendas: Prenda[]): Promise<CloudWardrobe> => {
  console.log('=== EXPORTANDO PRENDAS A LA NUBE ===');
  console.log('Número de prendas:', localPrendas.length);
  console.log('SYNC_API_URL:', SYNC_API_URL);

  try {
    const token = await getToken();
    if (!token) {
      console.error('Usuario no autenticado para exportar');
      throw new Error('Usuario no autenticado.');
    }

    console.log('Token obtenido:', token ? 'Sí' : 'No');

    // Convertir prendas locales al formato de la nube
    const cloudItems: CloudClothingItem[] = localPrendas.map(prenda => ({
      id: prenda.id.toString(),
      name: prenda.name,
      type: prenda.type,
      season: prenda.season,
      style: prenda.style,
      imageUri: prenda.cloudImageUri || undefined,
      primaryColor: prenda.primaryColor || undefined,
      secondaryColor: prenda.secondaryColor || undefined,
      syncStatus: prenda.syncStatus,
      updatedAt: new Date().toISOString(),
    }));

    console.log('Items a exportar:', cloudItems.length);

    const url = `${SYNC_API_URL}/v1/sync/export`;
    console.log('Exportando a URL:', url);

    const response = await axios.post(url, cloudItems, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    console.log('Respuesta status:', response.status);
    console.log('Respuesta data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error exportando a la nube:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error - Status:', error.response?.status);
      console.error('Axios error - Data:', error.response?.data);
      console.error('Axios error - Message:', error.message);
    }
    throw error;
  }
};

/**
 * Descarga prendas desde la nube
 */
export const downloadFromCloud = async (): Promise<CloudWardrobe> => {
  console.log('=== DESCARGANDO PRENDAS DESDE LA NUBE ===');
  console.log('SYNC_API_URL:', SYNC_API_URL);

  try {
    const token = await getToken();
    if (!token) {
      console.error('Usuario no autenticado para descargar');
      throw new Error('Usuario no autenticado.');
    }

    console.log('Token obtenido:', token ? 'Sí' : 'No');

    const url = `${SYNC_API_URL}/v1/sync/download`;
    console.log('Descargando desde:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    console.log('Respuesta status:', response.status);
    console.log('Respuesta data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error descargando desde la nube:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error - Status:', error.response?.status);
      console.error('Axios error - Data:', error.response?.data);
      console.error('Axios error - Message:', error.message);
    }
    throw error;
  }
};

/**
 * Elimina una prenda de la nube
 */
export const deleteFromCloud = async (itemId: string): Promise<void> => {
  console.log('=== ELIMINANDO PRENDA DE LA NUBE ===');
  console.log('Item ID:', itemId);
  console.log('SYNC_API_URL:', SYNC_API_URL);

  try {
    const token = await getToken();
    if (!token) {
      console.error('Usuario no autenticado para eliminar');
      throw new Error('Usuario no autenticado.');
    }

    console.log('Token obtenido:', token ? 'Sí' : 'No');

    const url = `${SYNC_API_URL}/v1/sync/item/${itemId}`;
    console.log('Eliminando desde:', url);

    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    console.log('Respuesta status:', response.status);
    console.log('Prenda eliminada exitosamente');
  } catch (error) {
    console.error('Error eliminando de la nube:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error - Status:', error.response?.status);
      console.error('Axios error - Data:', error.response?.data);
      console.error('Axios error - Message:', error.message);
    }
    throw error;
  }
};
