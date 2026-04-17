import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Prenda, useClosetStore } from './useClosetStore';

function hsvToHex(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  h /= 360;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const HSVPicker = ({ label, color, onColorChange }: { label: string, color: string, onColorChange: (hex: string) => void }) => {
  const [h, setH] = useState(0);
  const [s, setS] = useState(1);
  const [v, setV] = useState(1);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      onColorChange(hsvToHex(h, s, v));
    } else {
      onColorChange('');
    }
  }, [h, s, v, enabled]);

  if (!enabled) {
    return (
      <TouchableOpacity style={styles.enableColorBtn} onPress={() => setEnabled(true)}>
        <Text style={styles.enableColorText}>+ Agregar {label}</Text>
      </TouchableOpacity>
    );
  }

  const currentColor = hsvToHex(h, s, v);

  return (
    <View style={styles.colorPickerContainer}>
      <View style={styles.colorHeader}>
        <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
        <Text style={styles.colorLabel}>{label}: {currentColor}</Text>
        <TouchableOpacity onPress={() => setEnabled(false)}><Text style={styles.removeColorText}>Quitar</Text></TouchableOpacity>
      </View>
      <Text style={styles.sliderLabel}>Tono (Hue): {Math.round(h)}°</Text>
      <Slider maximumValue={360} value={h} onValueChange={setH} minimumTrackTintColor={currentColor} thumbTintColor={currentColor} />
      <Text style={styles.sliderLabel}>Saturación: {Math.round(s * 100)}%</Text>
      <Slider maximumValue={1} value={s} onValueChange={setS} minimumTrackTintColor={currentColor} thumbTintColor={currentColor} />
      <Text style={styles.sliderLabel}>Brillo (Value): {Math.round(v * 100)}%</Text>
      <Slider maximumValue={1} value={v} onValueChange={setV} minimumTrackTintColor={currentColor} thumbTintColor={currentColor} />
    </View>
  );
};

export default function AddGarmentScreen({ navigation }: any) {
  const addPrenda = useClosetStore((state) => state.addPrenda);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<Prenda['type']>('Polera');
  const [season, setSeason] = useState<Prenda['season']>('Verano');
  const [style, setStyle] = useState<Prenda['style']>('Informal');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5, // Calidad baja para que guarde rápido y no ocupe mucho espacio
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu cámara.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la prenda es obligatorio.');
      return;
    }

    await addPrenda({ name, type, season, style, imageUri, primaryColor, secondaryColor });
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
      
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>Sin Foto</Text></View>
        )}
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}><Text style={styles.photoBtnText}>📷 Cámara</Text></TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}><Text style={styles.photoBtnText}>🖼️ Galería</Text></TouchableOpacity>
        </View>
      </View>

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

      <Text style={styles.label}>Colores de la prenda</Text>
      <HSVPicker label="Color Principal" color={primaryColor} onColorChange={setPrimaryColor} />
      <HSVPicker label="Color Secundario" color={secondaryColor} onColorChange={setSecondaryColor} />

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
  imageContainer: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  previewImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  placeholderText: { color: '#999' },
  photoButtons: { flexDirection: 'row', gap: 10 },
  photoBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#e0e0e0', borderRadius: 20 },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
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
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  colorPickerContainer: { marginBottom: 24, padding: 16, backgroundColor: '#fafafa', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  colorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  colorPreview: { width: 30, height: 30, borderRadius: 15, marginRight: 12, borderWidth: 1, borderColor: '#ddd' },
  colorLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
  sliderLabel: { fontSize: 12, color: '#666', marginTop: 8 },
  enableColorBtn: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  enableColorText: { color: '#333', fontWeight: '600' },
  removeColorText: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold' }
});