import * as SQLite from 'expo-sqlite';
import { create } from 'zustand';

export interface Prenda {
  id: number;
  name: string;
  type: 'Sombrero' | 'Polera' | 'Pantalón' | 'Calzado';
  season: 'Verano' | 'Invierno';
  style: 'Formal' | 'Informal';
  imageUri?: string | null;
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
  loadPrendas: () => Promise<void>;
  addPrenda: (prenda: Omit<Prenda, 'id'>) => Promise<void>;
  deletePrenda: (id: number) => Promise<void>;
  // RF-2.4: Espacio reservado para editar (Edit)
  editPrenda: (id: number, updatedPrenda: Omit<Prenda, 'id'>) => Promise<void>;
  // Outfit functions
  addOutfit: (outfit: Omit<Outfit, 'id'>) => Promise<void>;
  deleteOutfit: (id: number) => Promise<void>;
  loadOutfits: () => Promise<void>;
}

const DB_NAME = 'closet.db';

export const useClosetStore = create<ClosetState>((set, get) => ({
  prendas: [],
  outfits: [],
  isLoading: true,

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
        'INSERT INTO prendas (name, type, season, style, imageUri, primaryColor, secondaryColor) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [prenda.name, prenda.type, prenda.season, prenda.style, prenda.imageUri || null, prenda.primaryColor || '', prenda.secondaryColor || '']
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
        'UPDATE prendas SET name = ?, type = ?, season = ?, style = ?, imageUri = ?, primaryColor = ?, secondaryColor = ? WHERE id = ?',
        [updatedPrenda.name, updatedPrenda.type, updatedPrenda.season, updatedPrenda.style, updatedPrenda.imageUri || null, updatedPrenda.primaryColor || '', updatedPrenda.secondaryColor || '', id]
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
      const allRows = await db.getAllAsync<Outfit>('SELECT * FROM outfits ORDER BY id DESC');
      set({ outfits: allRows });
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
  }
}));