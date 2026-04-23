import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { initDB } from '../db';
import { Prenda, useClosetStore } from './useClosetStore';
import WeatherWidget from './WeatherWidget';

const CATEGORIES = ['Sombrero', 'Polera', 'Pantalón', 'Calzado'];

export default function MyClosetScreen({ navigation }: any) {
  const { prendas, isLoading, loadPrendas, deletePrenda } = useClosetStore();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDB();
      await loadPrendas();
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
    setIsSyncing(true);
    try {
      // Simulación de sincronización con la nube
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Éxito', 'Todas tus prendas han sido sincronizadas con la nube');
    } catch (error) {
      Alert.alert('Error', 'No se pudo sincronizar con la nube');
    } finally {
      setIsSyncing(false);
    }
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
          <Text style={styles.syncBtnText}>☁️ Sincronizar con la nube</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  cardSub: { fontSize: 12, color: '#666', marginBottom: 12 },
  colorDotsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  colorDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  deleteBtn: { backgroundColor: '#ffebee', padding: 6, borderRadius: 6, alignItems: 'center' },
  deleteBtnText: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold' },
  emptyText: { marginLeft: 16, fontStyle: 'italic', color: '#999' },
  addBtn: { backgroundColor: '#000', margin: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  syncBtn: { backgroundColor: '#007AFF', margin: 16, marginTop: 0, padding: 16, borderRadius: 8, alignItems: 'center' },
  syncBtnDisabled: { backgroundColor: '#ccc' },
  syncBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});