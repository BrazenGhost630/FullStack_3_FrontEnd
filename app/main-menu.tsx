import ConfigScreen from '@/components/ConfigScreen';
import { useClosetStore } from '@/components/useClosetStore';
import { deleteToken } from '@/services/authService';
import { useConfigStore } from '@/stores/useConfigStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MainMenuScreen() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { locationEnabled, darkMode } = useConfigStore();
  const { syncFromCloud } = useClosetStore();

  const handleEnterCloset = () => {
    // Navega al grupo de pestañas donde está el closet
    router.push('/(tabs)');
  };

  const handleCloudSync = async () => {
    setSyncing(true);
    Alert.alert(
      'Sincronización',
      '¿Deseas sincronizar los datos desde la nube? Esto sobrescribirá tus datos locales.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setSyncing(false),
        },
        {
          text: 'Sincronizar',
          onPress: async () => {
            try {
              await syncFromCloud();
              Alert.alert('Éxito', 'Datos sincronizados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo sincronizar los datos');
            } finally {
              setSyncing(false);
            }
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    setShowConfig(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await deleteToken();
            router.replace('/login');
          },
        },
      ]
    );
  };

  // Create dynamic styles based on dark mode
  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa' },
    title: { ...styles.title, color: darkMode ? '#ffffff' : '#2c3e50' },
    subtitle: { ...styles.subtitle, color: darkMode ? '#b0b0b0' : '#7f8c8d' },
    footerText: { ...styles.footerText, color: darkMode ? '#b0b0b0' : '#7f8c8d' },
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>¿Qué me pongo?</Text>
        <Text style={dynamicStyles.subtitle}>Tu armario inteligente</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleEnterCloset}>
          <Text style={styles.primaryButtonText}>👔 Mi Armario</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleCloudSync} disabled={syncing}>
          {syncing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.secondaryButtonText}>Sincronizando...</Text>
            </View>
          ) : (
            <Text style={styles.secondaryButtonText}>☁️ Sincronizar Datos</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.tertiaryButton]} onPress={handleSettings}>
          <Text style={styles.tertiaryButtonText}>⚙️ Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={dynamicStyles.footerText}>
          {locationEnabled ? '📍 Ubicación activada' : '📍 Ubicación desactivada'}
        </Text>
      </View>

      <Modal visible={showConfig} animationType="slide" presentationStyle="fullScreen">
        <ConfigScreen onClose={() => setShowConfig(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#7f8c8d' },
  buttonContainer: { flex: 1, justifyContent: 'center', gap: 16 },
  button: { padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  primaryButton: { backgroundColor: '#3498db' },
  secondaryButton: { backgroundColor: '#27ae60' },
  tertiaryButton: { backgroundColor: '#95a5a6' },
  logoutButton: { backgroundColor: '#e74c3c' },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  secondaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  tertiaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  logoutButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 14, color: '#7f8c8d' },
});