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
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Usuario no autenticado.');
    }

    const formData = new FormData();
    formData.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: `garment_${Date.now()}.jpg`,
    } as any);

    const response = await axios.post(`${SYNC_API_URL}/v1/sync/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

/**
 * Exporta prendas a la nube
 */
export const exportToCloud = async (localPrendas: Prenda[]): Promise<CloudWardrobe> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Usuario no autenticado.');
    }

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

    const url = `${SYNC_API_URL}/v1/sync/export`;
    console.log('Exportando a URL:', url);
    const response = await axios.post(url, cloudItems, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error('Error exportando a la nube:', error);
    throw error;
  }
};

/**
 * Descarga prendas desde la nube
 */
export const downloadFromCloud = async (): Promise<CloudWardrobe> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Usuario no autenticado.');
    }

    const response = await axios.get(`${SYNC_API_URL}/v1/sync/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error('Error descargando desde la nube:', error);
    throw error;
  }
};

/**
 * Elimina una prenda de la nube
 */
export const deleteFromCloud = async (itemId: string): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Usuario no autenticado.');
    }

    await axios.delete(`${SYNC_API_URL}/v1/sync/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });
  } catch (error) {
    console.error('Error eliminando de la nube:', error);
    throw error;
  }
};
