import * as SecureStore from 'expo-secure-store';

export const DB_KEY_NAME = 'closet_db_key';

export class SecureStorage {
  static async generateDatabaseKey(): Promise<string> {
    // Generate a random 32-character key for SQLCipher
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  static async getDatabaseKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(DB_KEY_NAME);
    } catch (error) {
      console.error('Error getting database key:', error);
      return null;
    }
  }

  static async setDatabaseKey(key: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(DB_KEY_NAME, key);
      return true;
    } catch (error) {
      console.error('Error setting database key:', error);
      return false;
    }
  }

  static async hasDatabaseKey(): Promise<boolean> {
    const key = await this.getDatabaseKey();
    return key !== null;
  }

  static async removeDatabaseKey(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(DB_KEY_NAME);
      return true;
    } catch (error) {
      console.error('Error removing database key:', error);
      return false;
    }
  }
}
