import * as SQLite from 'expo-sqlite';
import { create } from 'zustand';
import { syncGarmentToCloud, checkInternetConnection } from '../services/closet/cloudSync';

export interface Prenda {
  id: number;
  name: string;
  type: 'Sombrero' | 'Polera' | 'Pantalón' | 'Calzado';
  season: 'Verano' | 'Invierno';
  style: 'Formal' | 'Informal';
  imageUri?: string | null;        // URI local
  cloudImageUri?: string | null;   // URL de la nube
  syncStatus: 'pending' | 'synced' | 'error' | 'pending_delete'; // Añadido 'pending_delete'
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
  // addPrenda: (prenda: Omit<Prenda, 'id'>) => Promise<void>; // Comentado para usar la nueva firma
  addPrenda: (prenda: Omit<Prenda, 'id'>) => Promise<void>;
  deletePrenda: (id: number) => Promise<void>;
  // RF-2.4: Espacio reservado para editar (Edit)
  editPrenda: (id: number, updatedPrenda: Omit<Prenda, 'id'>) => Promise<void>;
  // Outfit functions
  addOutfit: (outfit: Omit<Outfit, 'id'>) => Promise<void>;
  deleteOutfit: (id: number) => Promise<void>;
  loadOutfits: () => Promise<void>;
  replaceAllPrendas: (prendas: Prenda[]) => Promise<void>;
  // Sync functions
  syncToCloud: () => Promise<void>;
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
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const allRows = await db.getAllAsync<Prenda>('SELECT * FROM prendas ORDER BY id DESC');
      set({ prendas: allRows, isLoading: false });
    } catch (error) {
      console.error("Error cargando prendas:", error);
      set({ isLoading: false });
    }
  },

  addPrenda: async (prenda) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const result = await db.runAsync(
        'INSERT INTO prendas (name, type, season, style, imageUri, cloudImageUri, syncStatus, primaryColor, secondaryColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [prenda.name, prenda.type, prenda.season, prenda.style, prenda.imageUri || null, prenda.cloudImageUri || null, prenda.syncStatus || 'pending', prenda.primaryColor || '', prenda.secondaryColor || '']
      );
      const newPrenda: Prenda = { ...prenda, id: result.lastInsertRowId };
      set((state) => ({ prendas: [newPrenda, ...state.prendas] }));
    } catch (error) {
      console.error("Error agregando prenda:", error);
    }
  },

  deletePrenda: async (id) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.runAsync('DELETE FROM prendas WHERE id = ?', [id]);
      set((state) => ({ prendas: state.prendas.filter(p => p.id !== id) }));
    } catch (error) {
      console.error("Error eliminando prenda:", error);
    }
  },

  editPrenda: async (id, updatedPrenda) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
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
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      // Los datos de la DB vienen con 'prendas' como string JSON y 'createdAt' como string ISO
      const rawOutfits = await db.getAllAsync<any>('SELECT * FROM outfits ORDER BY id DESC');
      const parsedOutfits = rawOutfits.map(o => ({
        ...o,
        prendas: JSON.parse(o.prendas),
        createdAt: new Date(o.createdAt),
      }));
      set({ outfits: parsedOutfits });
    } catch (error) {
      console.error("Error cargando outfits:", error);
    }
  },

  addOutfit: async (outfit) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
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
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);
      set((state) => ({ outfits: state.outfits.filter(o => o.id !== id) }));
    } catch (error) {
      console.error("Error eliminando outfit:", error);
    }
  },

  replaceAllPrendas: async (newPrendas) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      // Operación destructiva: borra todas las prendas locales y las reemplaza
      await db.runAsync('DELETE FROM prendas');
      
      // Inserta las nuevas prendas de la nube
      for (const prenda of newPrendas) {
        await db.runAsync(
          'INSERT INTO prendas (id, name, type, season, style, imageUri, cloudImageUri, syncStatus, primaryColor, secondaryColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [prenda.id, prenda.name, prenda.type, prenda.season, prenda.style, prenda.imageUri || null, prenda.cloudImageUri || null, 'synced', prenda.primaryColor || '', prenda.secondaryColor || '']
        );
      }
      // Actualiza el estado en la UI
      set({ prendas: newPrendas });
    } catch (error) {
      console.error("Error reemplazando todas las prendas:", error);
      throw error; // Propagar el error para que la UI pueda manejarlo
    }
  },

  syncToCloud: async () => {
    const { prendas } = get();
    const pendingPrendas = prendas.filter(p => p.syncStatus === 'pending');
    
    if (pendingPrendas.length === 0) {
      console.log("No hay prendas pendientes de sincronización");
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
      for (const prenda of pendingPrendas) {
        const result = await syncGarmentToCloud(prenda);
        
        if (result.success) {
          // Actualizar estado a sincronizado con la URL de la nube
          await get().updateSyncStatus(prenda.id, 'synced', result.cloudImageUri);
        } else {
          // Marcar como error
          await get().updateSyncStatus(prenda.id, 'error');
          console.error(`Error sincronizando prenda ${prenda.name}: ${result.error}`);
        }
      }
      
      const syncedCount = pendingPrendas.filter(p => p.syncStatus === 'synced').length;
      console.log(`Sincronizadas ${syncedCount} de ${pendingPrendas.length} prendas`);
    } catch (error) {
      console.error("Error en sincronización:", error);
      // Marcar prendas como error
      for (const prenda of pendingPrendas) {
        await get().updateSyncStatus(prenda.id, 'error');
      }
    } finally {
      set({ isSyncing: false });
    }
  },

  updateSyncStatus: async (id, status, cloudImageUri) => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
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