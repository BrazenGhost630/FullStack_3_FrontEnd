import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { initDB } from '../../db';
import { Prenda, useClosetStore } from './useClosetStore';
import { useConfigStore } from '../../stores/useConfigStore';
import WeatherWidget from './WeatherWidget';
import ConfigScreen from './ConfigScreen';

const CATEGORIES = ['Sombrero', 'Polera', 'Pantalón', 'Calzado'];

export default function MyClosetScreen({ navigation }: any) {
  const { prendas, isLoading, isSyncing, loadPrendas, deletePrenda, syncToCloud } = useClosetStore();
  const { loadConfig } = useConfigStore();
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDB();
      await loadPrendas();
      await loadConfig(); // Cargar configuración de geolocalización al inicio
    };
    setup();
  }, []);

  // Agrupar las prendas para los carruseles (RF-2.2)
  const groupedPrendas = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = prendas.filter(p => p.type === category);
      return acc;
    }, {} as Record<string, Prenda[]>);
  }, [prendas]);

  const handleSync = async () => {
    const pendingCount = prendas.filter(p => p.syncStatus === 'pending').length;
    
    if (pendingCount === 0) {
      Alert.alert('Información', 'No hay prendas pendientes de sincronización.');
      return;
    }
    
    Alert.alert(
      'Sincronizar con la Nube',
      `Se sincronizarán ${pendingCount} prendas pendientes. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sincronizar', onPress: () => syncToCloud() }
      ]
    );
  };

  const renderPrenda = ({ item }: { item: Prenda }) => (
    <View style={styles.card}>
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.cardImage} />}
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSub}>{item.season} • {item.style}</Text>
      {item.primaryColor ? (
        <View style={styles.colorDotsRow}>
          <View style={[styles.colorDot, { backgroundColor: item.primaryColor }]} />
          {item.secondaryColor ? <View style={[styles.colorDot, { backgroundColor: item.secondaryColor }]} /> : null}
        </View>
      ) : null}
      <View style={styles.syncStatusContainer}>
        {item.syncStatus === 'pending' && <Text style={styles.pendingText}>⏳ Pendiente</Text>}
        {item.syncStatus === 'synced' && <Text style={styles.syncedText}>✅ Sincronizado</Text>}
        {item.syncStatus === 'error' && <Text style={styles.errorText}>❌ Error</Text>}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePrenda(item.id)}>
        <Text style={styles.deleteBtnText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <WeatherWidget prendas={prendas} />
        {CATEGORIES.map(category => (
          <View key={category} style={styles.carouselContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {groupedPrendas[category].length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={groupedPrendas[category]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPrenda}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            ) : (
              <Text style={styles.emptyText}>No hay prendas en esta categoría.</Text>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddGarment')}>
          <Text style={styles.addBtnText}>+ Agregar Prenda</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]} 
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncBtnText}>☁️ Sincronizar con la Nube</Text>
          )}
        </TouchableOpacity>
        <View style={styles.syncInfo}>
          <Text style={styles.syncInfoText}>
            Pendientes: {prendas.filter(p => p.syncStatus === 'pending').length} | 
            Sincronizadas: {prendas.filter(p => p.syncStatus === 'synced').length} | 
            Errores: {prendas.filter(p => p.syncStatus === 'error').length}
          </Text>
        </View>
      </ScrollView>
      
      {/* Ícono de configuración */}
      <TouchableOpacity 
        style={styles.configIcon} 
        onPress={() => setShowConfig(true)}
      >
        <Text style={styles.configIconText}>⚙️</Text>
      </TouchableOpacity>
      
      {/* Modal de configuración */}
      <Modal
        visible={showConfig}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ConfigScreen onClose={() => setShowConfig(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carouselContainer: { marginBottom: 24, marginTop: 10 },
  categoryTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16, marginBottom: 12, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#666', marginBottom: 8 },
  colorDotsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  colorDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  syncStatusContainer: { marginBottom: 8 },
  pendingText: { fontSize: 10, color: '#ff9800', fontWeight: 'bold' },
  syncedText: { fontSize: 10, color: '#4caf50', fontWeight: 'bold' },
  errorText: { fontSize: 10, color: '#f44336', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ffebee', padding: 6, borderRadius: 6, alignItems: 'center' },
  deleteBtnText: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold' },
  emptyText: { marginLeft: 16, fontStyle: 'italic', color: '#999' },
  addBtn: { backgroundColor: '#000', margin: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  syncBtn: { backgroundColor: '#2196f3', marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 8, alignItems: 'center' },
  syncBtnDisabled: { backgroundColor: '#ccc' },
  syncBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  syncInfo: { marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: '#e3f2fd', borderRadius: 8 },
  syncInfoText: { fontSize: 12, color: '#1976d2', textAlign: 'center', fontWeight: '600' },
  configIcon: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  configIconText: {
    fontSize: 20,
  }
});