import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Prenda, useClosetStore } from './useClosetStore';

interface Outfit {
  id: number;
  name: string;
  prendas: Prenda[];
  createdAt: Date;
}

export default function OutfitCreatorScreen() {
  const { prendas } = useClosetStore();
  const [selectedPrendas, setSelectedPrendas] = useState<Prenda[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);

  const CATEGORIES = ['Sombrero', 'Polera', 'Pantalón', 'Calzado'];

  const groupedPrendas = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = prendas.filter(p => p.type === category);
      return acc;
    }, {} as Record<string, Prenda[]>);
  }, [prendas]);

  const togglePrendaSelection = (prenda: Prenda) => {
    setSelectedPrendas(prev => {
      const isSelected = prev.some(p => p.id === prenda.id);
      if (isSelected) {
        return prev.filter(p => p.id !== prenda.id);
      } else {
        return [...prev, prenda];
      }
    });
  };

  const saveOutfit = () => {
    if (selectedPrendas.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una prenda para crear un outfit');
      return;
    }

    if (!outfitName.trim()) {
      Alert.alert('Error', 'Debes darle un nombre a tu outfit');
      return;
    }

    const newOutfit: Outfit = {
      id: Date.now(),
      name: outfitName,
      prendas: [...selectedPrendas],
      createdAt: new Date()
    };

    setSavedOutfits(prev => [newOutfit, ...prev]);
    setSelectedPrendas([]);
    setOutfitName('');
    Alert.alert('Éxito', 'Outfit guardado correctamente');
  };

  const clearSelection = () => {
    setSelectedPrendas([]);
    setOutfitName('');
  };

  const renderPrendaItem = ({ item }: { item: Prenda }) => {
    const isSelected = selectedPrendas.some(p => p.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.prendaItem, isSelected && styles.prendaItemSelected]}
        onPress={() => togglePrendaSelection(item)}
      >
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.prendaImage} />
        )}
        <View style={styles.prendaInfo}>
          <Text style={styles.prendaName}>{item.name}</Text>
          <Text style={styles.prendaDetails}>{item.season} • {item.style}</Text>
        </View>
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          <Text style={styles.selectionIndicatorText}>{isSelected ? '✓' : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOutfitItem = ({ item }: { item: Outfit }) => (
    <View style={styles.outfitItem}>
      <Text style={styles.outfitName}>{item.name}</Text>
      <Text style={styles.outfitDate}>
        {item.prendas.length} prendas • {item.createdAt.toLocaleDateString()}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {item.prendas.map(prenda => (
          <View key={prenda.id} style={styles.miniPrenda}>
            {prenda.imageUri && (
              <Image source={{ uri: prenda.imageUri }} style={styles.miniPrendaImage} />
            )}
            <Text style={styles.miniPrendaName} numberOfLines={1}>
              {prenda.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crea tu Outfit</Text>
      
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Selecciona tus prendas:</Text>
        
        {CATEGORIES.map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {groupedPrendas[category].length > 0 ? (
              <FlatList
                data={groupedPrendas[category]}
                renderItem={renderPrendaItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>No hay prendas en esta categoría</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Tu Outfit ({selectedPrendas.length} prendas)</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre del outfit:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Outfit casual de verano"
            value={outfitName}
            onChangeText={setOutfitName}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
          {selectedPrendas.map(prenda => (
            <View key={prenda.id} style={styles.selectedPrenda}>
              {prenda.imageUri && (
                <Image source={{ uri: prenda.imageUri }} style={styles.selectedPrendaImage} />
              )}
              <Text style={styles.selectedPrendaName} numberOfLines={1}>
                {prenda.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.clearBtn} onPress={clearSelection}>
            <Text style={styles.clearBtnText}>Limpiar selección</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={saveOutfit}>
            <Text style={styles.saveBtnText}>Guardar Outfit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {savedOutfits.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>Outfits Guardados</Text>
          <FlatList
            data={savedOutfits}
            renderItem={renderOutfitItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  selectionSection: {
    marginBottom: 32,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  prendaItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prendaItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  prendaImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  prendaInfo: {
    flex: 1,
  },
  prendaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  prendaDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  selectionIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    marginLeft: 8,
  },
  previewSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  previewScroll: {
    marginBottom: 16,
  },
  selectedPrenda: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
  },
  selectedPrendaImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  selectedPrendaName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  savedSection: {
    marginBottom: 32,
  },
  outfitItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  outfitDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  miniPrenda: {
    alignItems: 'center',
    marginRight: 12,
    width: 60,
  },
  miniPrendaImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    backgroundColor: '#eee',
  },
  miniPrendaName: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
  },
});
