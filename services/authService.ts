import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';

export async function saveToken(token: string): Promise<void> {
  try {
    let tokenToSave = token;
    
    // Defensa en tiempo de ejecución: SecureStore solo acepta strings
    if (typeof token !== 'string') {
      if (token && typeof token === 'object' && 'token' in token) {
        tokenToSave = String((token as any).token); // Extrae el token si pasaron el response completo
      } else {
        tokenToSave = typeof token === 'object' ? JSON.stringify(token) : String(token);
      }
    }

    await SecureStore.setItemAsync(TOKEN_KEY, tokenToSave);
  } catch (error) {
    console.error('Error guardando el token de autenticación', error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error obteniendo el token de autenticación', error);
    return null;
  }
}

export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error eliminando el token de autenticación', error);
  }
}