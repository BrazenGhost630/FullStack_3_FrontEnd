import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, style, ...textInputProps }: FormFieldProps) {
  const inputStyles = [
    estilos.input,
    error ? estilos.inputConError : null,
    style,
  ];

  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{label}</Text>
      <TextInput
        style={inputStyles}
        placeholderTextColor="#A0A0A0"
        {...textInputProps}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: 20 },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
  },
  inputConError: { borderColor: '#E74C3C', backgroundColor: '#FFF5F5' },
  error: { marginTop: 5, fontSize: 12, color: '#E74C3C' },
});