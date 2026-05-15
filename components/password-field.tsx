import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, type TextInputProps } from 'react-native';

type PasswordFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function PasswordField({ label, error, style, ...textInputProps }: PasswordFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const containerStyles = [
    estilos.filaContrasena,
    error ? estilos.inputConError : null,
  ];

  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{label}</Text>
      <View style={containerStyles}>
        <TextInput
          style={[estilos.inputContrasena, style]}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!isPasswordVisible}
          {...textInputProps}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={estilos.botonVer}
        >
          <Text style={estilos.textoVer}>
            {isPasswordVisible ? "Ocultar" : "Ver"}
          </Text>
        </TouchableOpacity>
      </View>
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
  inputConError: { borderColor: '#E74C3C', backgroundColor: '#FFF5F5' },
  filaContrasena: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  inputContrasena: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  botonVer: { paddingHorizontal: 14, height: 48, justifyContent: "center" },
  textoVer: { fontSize: 13, color: "#2C3E50", fontWeight: "600" },
  error: { marginTop: 5, fontSize: 12, color: '#E74C3C' },
});