import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Prenda, useClosetStore } from './useClosetStore';

export default function AddGarmentScreen({ navigation }: any) {
  const addPrenda = useClosetStore((state) => state.addPrenda);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<Prenda['type']>('Polera');
  const [season, setSeason] = useState<Prenda['season']>('Verano');
  const [style, setStyle] = useState<Prenda['style']>('Informal');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la prenda es obligatorio.');
      return;
    }

    await addPrenda({ name, type, season, style });
    navigation.goBack();
  };

  const SelectionGroup = ({ title, options, selected, onSelect }: any) => (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt: string) => (
          <TouchableOpacity 
            key={opt} 
            style={[styles.optionBtn, selected === opt && styles.optionBtnSelected]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre de la prenda</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Camisa a cuadros"
        value={name}
        onChangeText={setName}
      />

      <SelectionGroup 
        title="Tipo de Prenda" 
        options={['Sombrero', 'Polera', 'Pantalón', 'Calzado']} 
        selected={type} 
        onSelect={setType} 
      />

      <SelectionGroup 
        title="Temporada" 
        options={['Verano', 'Invierno']} 
        selected={season} 
        onSelect={setSeason} 
      />

      <SelectionGroup 
        title="Estilo" 
        options={['Formal', 'Informal']} 
        selected={style} 
        onSelect={setStyle} 
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar Prenda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fafafa'
  },
  group: { marginBottom: 24 },
  groupTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'
  },
  optionBtnSelected: { backgroundColor: '#000', borderColor: '#000' },
  optionText: { color: '#666', fontSize: 14 },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});