import * as SQLite from 'expo-sqlite';
import { openDatabaseAsync as openWebDatabaseAsync } from './db-web';

const DB_NAME = 'closet.db';

export const initDB = async () => {
  try {
    // Use web fallback for web platform
    const db = typeof window !== 'undefined' 
      ? await openWebDatabaseAsync(DB_NAME)
      : await SQLite.openDatabaseAsync(DB_NAME);
    
    // RF-2.1: Generación del esquema de la tabla
    // NOTA: Drop table agregado temporalmente para aplicar las nuevas columnas en el MVP
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      DROP TABLE IF EXISTS prendas;
      CREATE TABLE IF NOT EXISTS prendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        season TEXT NOT NULL,
        style TEXT NOT NULL,
        imageUri TEXT,
        cloudImageUri TEXT,
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        primaryColor TEXT,
        secondaryColor TEXT
      );
    `);
    return db;
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
    throw error;
  }
};