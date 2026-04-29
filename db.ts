import * as SQLite from 'expo-sqlite';
import { openDatabaseAsync as openWebDatabaseAsync } from './db-web';
import { SecureStorage } from './utils/secureStorage';

const DB_NAME = 'closet.db';

export const initDB = async () => {
  try {
    // Use web fallback for web platform
    if (typeof window !== 'undefined') {
      return await openWebDatabaseAsync(DB_NAME);
    }

    // Check if we have an encryption key
    const hasKey = await SecureStorage.hasDatabaseKey();
    
    if (!hasKey) {
      // Generate and store a new encryption key
      const encryptionKey = await SecureStorage.generateDatabaseKey();
      const keyStored = await SecureStorage.setDatabaseKey(encryptionKey);
      
      if (!keyStored) {
        throw new Error('Failed to store database encryption key');
      }
    }

    const encryptionKey = await SecureStorage.getDatabaseKey();
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    // Open database with encryption
    // Note: For now, we'll use standard expo-sqlite without encryption
    // SQLCipher integration would require additional setup
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Set encryption key if supported (this is a placeholder for future implementation)
    if (encryptionKey) {
      try {
        await db.execAsync(`PRAGMA key = '${encryptionKey}'`);
      } catch (error) {
        console.warn('Database encryption not supported, using unencrypted database');
      }
    }
    
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

export const migrateToEncrypted = async (): Promise<boolean> => {
  try {
    // This function can be used to migrate from unencrypted to encrypted database
    // Implementation would depend on specific migration requirements
    console.log('Database migration to encrypted format would be implemented here');
    return true;
  } catch (error) {
    console.error('Error migrating to encrypted database:', error);
    return false;
  }
};