import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const logo = require("../../assets/images/icon.png");

export default function Registro() {
  const [nombres, setNombres] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({ nombres: "", correo: "", contrasena: "" });
  const [verContrasena, setVerContrasena] = useState(false);

  function validar() {
    let nuevosErrores = { nombres: "", correo: "", contrasena: "" };
    let valido = true;

    if (!nombres.trim()) {
      nuevosErrores.nombres = "El nombre es obligatorio.";
      valido = false;
    } else if (nombres.trim().length < 3) {
      nuevosErrores.nombres = "El nombre debe tener al menos 3 caracteres.";
      valido = false;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
      valido = false;
    } else if (!regexCorreo.test(correo)) {
      nuevosErrores.correo = "Ingresa un correo válido.";
      valido = false;
    }

    if (!contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
      valido = false;
    } else if (contrasena.length < 6) {
      nuevosErrores.contrasena = "La contraseña debe tener al menos 6 caracteres.";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  }

  function enviar() {
    if (validar()) {
      Alert.alert("¡Registro exitoso!", `Bienvenido, ${nombres.trim()}.`);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={estilos.imagen} />

        <Text style={estilos.titulo}>Crear cuenta</Text>
        <Text style={estilos.subtitulo}>Completa los datos para registrarte</Text>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Nombres</Text>
          <TextInput
            style={[estilos.input, errores.nombres ? estilos.inputConError : null]}
            placeholder="Ingrese su nombre"
            placeholderTextColor="#A0A0A0"
            value={nombres}
            onChangeText={(texto) => { setNombres(texto); setErrores({ ...errores, nombres: "" }); }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errores.nombres ? <Text style={estilos.error}>{errores.nombres}</Text> : null}
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={[estilos.input, errores.correo ? estilos.inputConError : null]}
            placeholder="Ingrese su correo"
            placeholderTextColor="#A0A0A0"
            value={correo}
            onChangeText={(texto) => { setCorreo(texto); setErrores({ ...errores, correo: "" }); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {errores.correo ? <Text style={estilos.error}>{errores.correo}</Text> : null}
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Contraseña</Text>
          <View style={[estilos.filaContrasena, errores.contrasena ? estilos.inputConError : null]}>
            <TextInput
              style={estilos.inputContrasena}
              placeholder="Ingrese su contraseña"
              placeholderTextColor="#A0A0A0"
              value={contrasena}
              onChangeText={(texto) => { setContrasena(texto); setErrores({ ...errores, contrasena: "" }); }}
              secureTextEntry={!verContrasena}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={enviar}
            />
            <TouchableOpacity onPress={() => setVerContrasena(!verContrasena)} style={estilos.botonVer}>
              <Text style={estilos.textoVer}>{verContrasena ? "Ocultar" : "Ver"}</Text>
            </TouchableOpacity>
          </View>
          {errores.contrasena ? <Text style={estilos.error}>{errores.contrasena}</Text> : null}
        </View>

        <TouchableOpacity style={estilos.boton} onPress={enviar} activeOpacity={0.85}>
          <Text style={estilos.textoBoton}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 40 },
  imagen: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 24,
    resizeMode: "contain",
  },
  titulo: { fontSize: 28, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, textAlign: "center" },
  subtitulo: { fontSize: 15, color: "#666666", marginBottom: 32, textAlign: "center" },
  campo: { marginBottom: 20 },
  etiqueta: { fontSize: 14, fontWeight: "600", color: "#333333", marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1A1A1A",
    backgroundColor: "#F9FAFB",
  },
  inputConError: { borderColor: "#E24B4A", backgroundColor: "#FFF5F5" },
  filaContrasena: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  inputContrasena: { flex: 1, height: 48, paddingHorizontal: 14, fontSize: 15, color: "#1A1A1A" },
  botonVer: { paddingHorizontal: 14, height: 48, justifyContent: "center" },
  textoVer: { fontSize: 13, color: "#5563DE", fontWeight: "600" },
  error: { marginTop: 5, fontSize: 12, color: "#E24B4A" },
  boton: {
    marginTop: 12,
    height: 52,
    backgroundColor: "#5563DE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBoton: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
});