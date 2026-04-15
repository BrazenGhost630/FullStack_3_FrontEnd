import * as SQLite from 'expo-sqlite';

const DB_NAME = 'closet.db';

export const initDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // RF-2.1: Generación del esquema de la tabla
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS prendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        season TEXT NOT NULL,
        style TEXT NOT NULL
      );
    `);
    return db;
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
    throw error;
  }
};