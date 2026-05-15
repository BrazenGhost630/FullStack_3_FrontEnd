import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, getCurrentLocation, getCachedLocation, clearLocationCache } from '../services/closet/locationService';
import { getComunaByName } from '../data/closet/chileRegions';

interface ConfigState {
  // Preferencias de ubicación
  locationEnabled: boolean;
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  
  // Selección manual
  selectedRegion: string | null;
  selectedComuna: string | null;
  
  // Preferencias de tema
  darkMode: boolean;
  
  // Funciones
  toggleLocation: () => Promise<void>;
  updateLocation: () => Promise<void>;
  setManualLocation: (region: string, comuna: string) => void;
  clearManualLocation: () => void;
  loadConfig: () => Promise<void>;
  clearError: () => void;
  toggleDarkMode: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      locationEnabled: true,
      currentLocation: null,
      isLoading: false,
      error: null,
      selectedRegion: null,
      selectedComuna: null,
      darkMode: false,

      // Activar/desactivar geolocalización
      toggleLocation: async () => {
        const currentState = get().locationEnabled;
        const newState = !currentState;
        
        set({ locationEnabled: newState });
        
        if (newState) {
          // Si se activa, obtener ubicación actual
          await get().updateLocation();
        } else {
          // Si se desactiva, limpiar ubicación pero mantener selección manual
          set({ currentLocation: null, error: null });
        }
      },

      // Establecer ubicación manual
      setManualLocation: (region: string, comuna: string) => {
        const comunaData = getComunaByName(region, comuna);
        
        if (comunaData) {
          const locationData: LocationData = {
            region,
            comuna,
            latitude: comunaData.latitude,
            longitude: comunaData.longitude
          };
          
          set({
            selectedRegion: region,
            selectedComuna: comuna,
            currentLocation: locationData,
            error: null
          });
        } else {
          set({
            error: 'Comuna no encontrada en la región seleccionada'
          });
        }
      },

      // Limpiar ubicación manual
      clearManualLocation: () => {
        set({
          selectedRegion: null,
          selectedComuna: null,
          currentLocation: null,
          error: null
        });
      },

      // Actualizar ubicación
      updateLocation: async () => {
        const { locationEnabled } = get();
        
        if (!locationEnabled) {
          set({ error: 'La geolocalización está desactivada' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Primero intentar obtener desde caché
          const cachedLocation = await getCachedLocation();
          if (cachedLocation) {
            set({ currentLocation: cachedLocation, isLoading: false });
            return;
          }

          // Si no hay caché, obtener ubicación actual
          const result = await getCurrentLocation();
          
          if (result.success && result.location) {
            set({ 
              currentLocation: result.location, 
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              error: result.error || 'Error obteniendo ubicación',
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false 
          });
        }
      },

      // Cargar configuración al iniciar
      loadConfig: async () => {
        set({ isLoading: true, error: null });

        try {
          // Cargar ubicación desde caché si existe
          const cachedLocation = await getCachedLocation();
          
          if (cachedLocation) {
            set({ 
              currentLocation: cachedLocation,
              isLoading: false 
            });
          } else {
            // Si no hay caché y la geolocalización está habilitada, obtener nueva ubicación
            const { locationEnabled } = get();
            if (locationEnabled) {
              await get().updateLocation();
            } else {
              set({ isLoading: false });
            }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error cargando configuración',
            isLoading: false 
          });
        }
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      },

      // Activar/desactivar modo oscuro
      toggleDarkMode: () => {
        const currentDarkMode = get().darkMode;
        set({ darkMode: !currentDarkMode });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locationEnabled: state.locationEnabled,
        currentLocation: state.currentLocation,
        darkMode: state.darkMode,
      }),
    }
  )
);
