import { create } from 'zustand';
import { getDB } from '../db';
import { checkInternetConnection, getGarmentsFromCloud, syncAllToCloud } from '../services/closet/cloudSync';

export interface Prenda {
  id: number;
  name: string;
  type: 'Sombrero' | 'Polera' | 'Pantalón' | 'Calzado';
  season: 'Verano' | 'Invierno';
  style: 'Formal' | 'Informal';
  imageUri?: string | null;        // URI local
  cloudImageUri?: string | null;   // URL de la nube
  syncStatus: 'pending' | 'synced' | 'error';
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Outfit {
  id: number;
  name: string;
  prendas: Prenda[];
  createdAt: Date;
}

//AddGarment

interface ClosetState {
  prendas: Prenda[];
  outfits: Outfit[];
  isLoading: boolean;
  isSyncing: boolean;
  loadPrendas: () => Promise<void>;
  addPrenda: (prenda: Omit<Prenda, 'id'>) => Promise<void>;
  deletePrenda: (id: number) => Promise<void>;
  // RF-2.4: Espacio reservado para editar (Edit)
  editPrenda: (id: number, updatedPrenda: Omit<Prenda, 'id'>) => Promise<void>;
  // Outfit functions
  addOutfit: (outfit: Omit<Outfit, 'id'>) => Promise<void>;
  deleteOutfit: (id: number) => Promise<void>;
  loadOutfits: () => Promise<void>;
  // Sync functions
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  updateSyncStatus: (id: number, status: 'pending' | 'synced' | 'error', cloudImageUri?: string) => Promise<void>;
}

const DB_NAME = 'closet.db';

export const useClosetStore = create<ClosetState>((set, get) => ({
  prendas: [],
  outfits: [],
  isLoading: true,
  isSyncing: false,

  loadPrendas: async () => {
    set({ isLoading: true });
    try {
      const db = await getDB();
      const allRows = await db.getAllAsync<Prenda>('SELECT * FROM prendas ORDER BY id DESC');
      console.log('Prendas desde DB:', allRows);
      console.log('Prendas con ID null:', allRows.filter(p => p.id == null));
      set({ prendas: allRows, isLoading: false });
    } catch (error) {
      console.error("Error cargando prendas:", error);
      set({ isLoading: false });
    }
  },

  addPrenda: async (prenda) => {
    try {
      console.log('Agregando prenda:', prenda);
      const db = await getDB();
      console.log('DB obtenida:', db);
      const result = await db.runAsync(
        'INSERT INTO prendas (name, type, season, style, imageUri, cloudImageUri, syncStatus, primaryColor, secondaryColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [prenda.name, prenda.type, prenda.season, prenda.style, prenda.imageUri || null, prenda.cloudImageUri || null, prenda.syncStatus || 'pending', prenda.primaryColor || '', prenda.secondaryColor || '']
      );
      console.log('Resultado de insert:', result);
      const newPrenda: Prenda = { ...prenda, id: result.lastInsertRowId };
      console.log('Nueva prenda con ID:', newPrenda);
      set((state) => ({ prendas: [newPrenda, ...state.prendas] }));
      console.log('Prendas después de agregar:', get().prendas);
    } catch (error) {
      console.error("Error agregando prenda:", error);
    }
  },

  deletePrenda: async (id) => {
    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM prendas WHERE id = ?', [id]);
      set((state) => ({ prendas: state.prendas.filter(p => p.id !== id) }));
    } catch (error) {
      console.error("Error eliminando prenda:", error);
    }
  },

  editPrenda: async (id, updatedPrenda) => {
    try {
      const db = await getDB();
      await db.runAsync(
        'UPDATE prendas SET name = ?, type = ?, season = ?, style = ?, imageUri = ?, cloudImageUri = ?, syncStatus = ?, primaryColor = ?, secondaryColor = ? WHERE id = ?',
        [updatedPrenda.name, updatedPrenda.type, updatedPrenda.season, updatedPrenda.style, updatedPrenda.imageUri || null, updatedPrenda.cloudImageUri || null, updatedPrenda.syncStatus || 'pending', updatedPrenda.primaryColor || '', updatedPrenda.secondaryColor || '', id]
      );
      set((state) => ({
        prendas: state.prendas.map(p => (p.id === id ? { ...updatedPrenda, id } : p))
      }));
    } catch (error) {
      console.error("Error editando prenda:", error);
    }
  },

  loadOutfits: async () => {
    try {
      const db = await getDB();
      const allRows = await db.getAllAsync<Outfit>('SELECT * FROM outfits ORDER BY id DESC');
      set({ outfits: allRows });
    } catch (error) {
      console.error("Error cargando outfits:", error);
    }
  },

  addOutfit: async (outfit) => {
    try {
      const db = await getDB();
      const result = await db.runAsync(
        'INSERT INTO outfits (name, prendas, createdAt) VALUES (?, ?, ?)',
        [outfit.name, JSON.stringify(outfit.prendas), outfit.createdAt.toISOString()]
      );
      const newOutfit: Outfit = { ...outfit, id: result.lastInsertRowId };
      set((state) => ({ outfits: [newOutfit, ...state.outfits] }));
    } catch (error) {
      console.error("Error agregando outfit:", error);
    }
  },

  deleteOutfit: async (id) => {
    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);
      set((state) => ({ outfits: state.outfits.filter(o => o.id !== id) }));
    } catch (error) {
      console.error("Error eliminando outfit:", error);
    }
  },

  syncToCloud: async () => {
    const { prendas } = get();
    
    if (prendas.length === 0) {
      console.log("No hay prendas para sincronizar");
      return;
    }

    // Verificar conexión a internet
    const hasConnection = await checkInternetConnection();
    if (!hasConnection) {
      console.log("Sin conexión a internet - no se puede sincronizar");
      return;
    }

    set({ isSyncing: true });
    
    try {
      const result = await syncAllToCloud(prendas);
      
      if (result.success) {
        // Actualizar todas las prendas a sincronizado
        for (const prenda of prendas) {
          if (prenda.syncStatus === 'pending') {
            await get().updateSyncStatus(prenda.id, 'synced');
          }
        }
        console.log(`Sincronizadas ${prendas.length} prendas a la nube`);
      } else {
        console.error(`Error en sincronización: ${result.error}`);
        // Marcar prendas pendientes como error
        for (const prenda of prendas) {
          if (prenda.syncStatus === 'pending') {
            await get().updateSyncStatus(prenda.id, 'error');
          }
        }
      }
    } catch (error) {
      console.error("Error en sincronización:", error);
      // Marcar prendas pendientes como error
      for (const prenda of prendas) {
        if (prenda.syncStatus === 'pending') {
          await get().updateSyncStatus(prenda.id, 'error');
        }
      }
    } finally {
      set({ isSyncing: false });
    }
  },

  syncFromCloud: async () => {
    // Verificar conexión a internet
    const hasConnection = await checkInternetConnection();
    if (!hasConnection) {
      console.log("Sin conexión a internet - no se puede descargar desde la nube");
      return;
    }

    set({ isSyncing: true });
    
    try {
      const cloudPrendas = await getGarmentsFromCloud();
      
      if (cloudPrendas.length === 0) {
        console.log("No hay prendas en la nube");
        return;
      }

      const db = await getDB();
      
      // Para cada prenda de la nube, verificar si existe localmente
      for (const cloudPrenda of cloudPrendas) {
        const existingPrenda = get().prendas.find(p => p.id === cloudPrenda.id);
        
        if (!existingPrenda) {
          // La prenda no existe localmente, agregarla
          await db.runAsync(
            'INSERT INTO prendas (name, type, season, style, imageUri, cloudImageUri, syncStatus, primaryColor, secondaryColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cloudPrenda.name, cloudPrenda.type, cloudPrenda.season, cloudPrenda.style, cloudPrenda.imageUri || null, cloudPrenda.cloudImageUri || null, cloudPrenda.syncStatus, cloudPrenda.primaryColor || '', cloudPrenda.secondaryColor || '']
          );
        } else {
          // La prenda existe, actualizar si la versión de la nube es más reciente
          await db.runAsync(
            'UPDATE prendas SET name = ?, type = ?, season = ?, style = ?, cloudImageUri = ?, syncStatus = ?, primaryColor = ?, secondaryColor = ? WHERE id = ?',
            [cloudPrenda.name, cloudPrenda.type, cloudPrenda.season, cloudPrenda.style, cloudPrenda.cloudImageUri || null, cloudPrenda.syncStatus, cloudPrenda.primaryColor || '', cloudPrenda.secondaryColor || '', cloudPrenda.id]
          );
        }
      }

      // Recargar prendas desde la base de datos
      await get().loadPrendas();
      
      console.log(`Descargadas ${cloudPrendas.length} prendas desde la nube`);
    } catch (error) {
      console.error("Error descargando desde la nube:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  updateSyncStatus: async (id, status, cloudImageUri) => {
    try {
      const db = await getDB();
      await db.runAsync(
        'UPDATE prendas SET syncStatus = ?, cloudImageUri = ? WHERE id = ?',
        [status, cloudImageUri || null, id]
      );
      
      set((state) => ({
        prendas: state.prendas.map(p => 
          p.id === id ? { ...p, syncStatus: status, cloudImageUri: cloudImageUri || p.cloudImageUri } : p
        )
      }));
    } catch (error) {
      console.error("Error actualizando estado de sincronización:", error);
    }
  }
}));