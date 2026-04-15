import * as SQLite from 'expo-sqlite';
import { create } from 'zustand';

export interface Prenda {
  id: number;
  name: string;
  type: 'Sombrero' | 'Polera' | 'Pantalón' | 'Calzado';
  season: 'Verano' | 'Invierno';
  style: 'Formal' | 'Informal';
}

interface ClosetState {
  prendas: Prenda[];
  isLoading: boolean;
  loadPrendas: () => Promise<void>;
  addPrenda: (prenda: Omit<Prenda, 'id'>) => Promise<void>;
  deletePrenda: (id: number) => Promise<void>;
  // RF-2.4: Espacio reservado para editar (Edit)
  editPrenda: (id: number, updatedPrenda: Omit<Prenda, 'id'>) => Promise<void>;
}

const DB_NAME = 'closet.db';

export const useClosetStore = create<ClosetState>((set, get) => ({
  prendas: [],
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
        'INSERT INTO prendas (name, type, season, style) VALUES (?, ?, ?, ?)',
        [prenda.name, prenda.type, prenda.season, prenda.style]
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
        'UPDATE prendas SET name = ?, type = ?, season = ?, style = ? WHERE id = ?',
        [updatedPrenda.name, updatedPrenda.type, updatedPrenda.season, updatedPrenda.style, id]
      );
      set((state) => ({
        prendas: state.prendas.map(p => (p.id === id ? { ...updatedPrenda, id } : p))
      }));
    } catch (error) {
      console.error("Error editando prenda:", error);
    }
  }
}));