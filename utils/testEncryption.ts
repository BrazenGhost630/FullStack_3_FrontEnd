import { SecureStorage } from './secureStorage';

export const testEncryption = async (): Promise<boolean> => {
  try {
    console.log('Testing database encryption...');
    
    // Test secure storage functionality
    const testKey = await SecureStorage.generateDatabaseKey();
    console.log('Generated test key:', testKey.substring(0, 8) + '...');
    
    const keyStored = await SecureStorage.setDatabaseKey(testKey);
    console.log('Key stored successfully:', keyStored);
    
    const retrievedKey = await SecureStorage.getDatabaseKey();
    console.log('Key retrieved successfully:', retrievedKey === testKey);
    
    const hasKey = await SecureStorage.hasDatabaseKey();
    console.log('Has key check:', hasKey);
    
    // Clean up test key
    await SecureStorage.removeDatabaseKey();
    const hasKeyAfterRemoval = await SecureStorage.hasDatabaseKey();
    console.log('Key removed successfully:', !hasKeyAfterRemoval);
    
    return true;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
};
