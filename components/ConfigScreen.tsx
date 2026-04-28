import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useConfigStore } from '../stores/useConfigStore';
import { CHILE_REGIONS, getRegionNames, getComunaNamesByRegion } from '../data/chileRegions';

interface ConfigScreenProps {
  onClose: () => void;
}

export default function ConfigScreen({ onClose }: ConfigScreenProps) {
  const {
    locationEnabled,
    currentLocation,
    isLoading,
    error,
    selectedRegion,
    selectedComuna,
    toggleLocation,
    updateLocation,
    setManualLocation,
    clearManualLocation,
    clearError
  } = useConfigStore();

  // Estados locales para los selectores
  const [tempRegion, setTempRegion] = useState(selectedRegion || '');
  const [tempComuna, setTempComuna] = useState(selectedComuna || '');

  // Limpiar error al montar el componente
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Sincronizar estados locales con el store
  useEffect(() => {
    setTempRegion(selectedRegion || '');
    setTempComuna(selectedComuna || '');
  }, [selectedRegion, selectedComuna]);

  const handleToggleLocation = async () => {
    try {
      await toggleLocation();
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar la configuración de geolocalización');
    }
  };

  const handleUpdateLocation = async () => {
    try {
      await updateLocation();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la ubicación');
    }
  };

  const handleRegionChange = (region: string) => {
    setTempRegion(region);
    setTempComuna(''); // Resetear comuna al cambiar región
  };

  const handleComunaChange = (comuna: string) => {
    setTempComuna(comuna);
    if (tempRegion && comuna) {
      setManualLocation(tempRegion, comuna);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Geolocalización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geolocalización</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Usar mi ubicación</Text>
              <Text style={styles.settingDescription}>
                Permite obtener clima basado en tu ubicación actual
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleToggleLocation}
              disabled={isLoading}
            />
          </View>

          {locationEnabled && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Ubicación actual</Text>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleUpdateLocation}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : currentLocation ? (
                <View style={styles.locationDetails}>
                  <Text style={styles.locationText}>
                    {currentLocation.comuna}, {currentLocation.region}
                  </Text>
                  <TouchableOpacity style={styles.updateButton} onPress={handleUpdateLocation}>
                    <Text style={styles.updateButtonText}>Actualizar ubicación</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.enableButton} onPress={handleUpdateLocation}>
                  <Text style={styles.enableButtonText}>Obtener ubicación</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Sección de Selección Manual */}
        {!locationEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleccionar ubicación manualmente</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Región</Text>
                <Text style={styles.settingDescription}>
                  Selecciona tu región de Chile
                </Text>
              </View>
            </View>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tempRegion}
                onValueChange={handleRegionChange}
                style={styles.picker}
                enabled={!isLoading}
              >
                <Picker.Item label="Selecciona una región..." value="" />
                {getRegionNames().map((region) => (
                  <Picker.Item key={region} label={region} value={region} />
                ))}
              </Picker>
            </View>

            {tempRegion && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Comuna</Text>
                    <Text style={styles.settingDescription}>
                      Selecciona tu comuna
                    </Text>
                  </View>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tempComuna}
                    onValueChange={handleComunaChange}
                    style={styles.picker}
                    enabled={!isLoading}
                  >
                    <Picker.Item label="Selecciona una comuna..." value="" />
                    {getComunaNamesByRegion(tempRegion).map((comuna) => (
                      <Picker.Item key={comuna} label={comuna} value={comuna} />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            {selectedRegion && selectedComuna && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Ubicación seleccionada</Text>
                <View style={styles.locationDetails}>
                  <Text style={styles.locationText}>
                    {selectedComuna}, {selectedRegion}
                  </Text>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        )}

        {/* Sección de Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Datos guardados</Text>
            <Text style={styles.infoValue}>Región y comuna</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precisión</Text>
            <Text style={styles.infoValue}>Aproximada</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Uso</Text>
            <Text style={styles.infoValue}>Clima personalizado</Text>
          </View>
        </View>

        {/* Sección de Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad</Text>
          
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              • Solo guardamos tu región y comuna{'\n'}
              • No almacenamos coordenadas GPS exactas{'\n'}
              • Puedes desactivar la geolocalización en cualquier momento{'\n'}
              • Los datos se usan únicamente para mostrar el clima de tu zona
            </Text>
          </View>
        </View>

        {/* Sección de Ayuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda</Text>
          
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>¿Por qué necesito geolocalización?</Text>
            <Text style={styles.helpText}>
              Para mostrar el clima exacto de tu zona y darte recomendaciones de prendas más precisas según el tiempo actual en tu ubicación.
            </Text>
            
            <Text style={styles.helpTitle}>¿Qué pasa si la desactivo?</Text>
            <Text style={styles.helpText}>
              La app seguirá funcionando, pero mostrará un clima general sin personalización para tu ubicación específica.
            </Text>
            
            <Text style={styles.helpTitle}>¿Puedo cambiar mi ubicación manualmente?</Text>
            <Text style={styles.helpText}>
              Sí, puedes actualizar tu ubicación presionando el botón "Actualizar ubicación" cuando la geolocalización esté activada.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  locationInfo: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationDetails: {
    paddingVertical: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  updateButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  updateButtonText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  enableButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  privacyContainer: {
    paddingVertical: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  helpContainer: {
    paddingVertical: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    color: '#333',
  },
});
