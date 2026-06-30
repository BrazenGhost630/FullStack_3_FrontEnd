import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FormField } from "@/components/form-field";
import { PasswordField } from "@/components/password-field";
import { saveToken } from "@/services/authService";
import { AUTH_API_URL } from "@/services/apiConfig";

const logo = require("../assets/images/icon.png");

const URL_REGISTRO = `${AUTH_API_URL}/auth/register`;
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,64}$/;

export default function Registro() {
  const router = useRouter();
  const [nombres, setNombres]               = useState("");
  const [correo, setCorreo]                 = useState("");
  const [contrasena, setContrasena]         = useState("");
  const [confirmar, setConfirmar]           = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando]             = useState(false);
  const [errores, setErrores]               = useState({
    nombres: "",
    correo: "",
    contrasena: "",
    confirmar: "",
    terminos: "",
  });

  function validar() {
    let nuevosErrores = { nombres: "", correo: "", contrasena: "", confirmar: "", terminos: "" };
    let valido = true;

    if (!nombres.trim()) {
      nuevosErrores.nombres = "El nombre de usuario es obligatorio.";
      valido = false;
    } else if (nombres.trim().length < 4 || nombres.trim().length > 30) {
      nuevosErrores.nombres = "El nombre debe tener entre 4 y 30 caracteres.";
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
    } else if (!REGEX_CONTRASENA.test(contrasena)) {
      nuevosErrores.contrasena = "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
      valido = false;
    }

    if (!confirmar) {
      nuevosErrores.confirmar = "Confirma tu contraseña.";
      valido = false;
    } else if (contrasena !== confirmar) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden.";
      valido = false;
    }

    if (!aceptaTerminos) {
      nuevosErrores.terminos = "Debes aceptar los términos y condiciones para registrarte.";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  }

  async function enviar() {
    console.log('=== INICIANDO REGISTRO ===');
    console.log('Nombre:', nombres);
    console.log('Correo:', correo);
    console.log('AUTH_API_URL:', AUTH_API_URL);
    console.log('URL_REGISTRO:', URL_REGISTRO);

    if (!validar()) return;

    setCargando(true);
    try {
      console.log('Haciendo fetch a:', URL_REGISTRO);
      const respuesta = await fetch(URL_REGISTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: nombres.trim(),
          email: correo.trim(),
          password: contrasena,
          confirmPassword: confirmar,
        }),
      });

      console.log('Respuesta status:', respuesta.status);
      console.log('Respuesta ok:', respuesta.ok);

      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log('Datos de respuesta:', datos);
        await saveToken(datos.token);
        Alert.alert(
          "¡Registro exitoso!",
          `Bienvenido, ${nombres.trim()}. Serás redirigido al menú principal.`,
          [{ text: "OK", onPress: () => router.replace("/main-menu") }]
        );
      } else {
        const errorData = await respuesta.json();
        console.error('Error de registro - Status:', respuesta.status);
        console.error('Error de registro - Data:', errorData);
        let errorMessage = "No se pudo completar el registro.";
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].defaultMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        Alert.alert("Error de registro", errorMessage);
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor o la respuesta fue inválida.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Image source={logo} style={estilos.imagen} />

        <Text style={estilos.titulo}>Crear cuenta</Text>
        <Text style={estilos.subtitulo}>Completa los datos para registrarte</Text>

        <FormField
          label="Nombre de usuario"
          placeholder="Ingrese su nombre"
          value={nombres}
          onChangeText={(t) => { setNombres(t); setErrores({ ...errores, nombres: "" }); }}
          error={errores.nombres}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <FormField
          label="Correo electrónico"
          placeholder="Ingrese su correo"
          value={correo}
          onChangeText={(t) => { setCorreo(t); setErrores({ ...errores, correo: "" }); }}
          error={errores.correo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <PasswordField
          label="Contraseña"
          placeholder="Ingrese su contraseña"
          value={contrasena}
          onChangeText={(t) => { setContrasena(t); setErrores({ ...errores, contrasena: "" }); }}
          error={errores.contrasena}
          autoCapitalize="none"
          returnKeyType="next"
        />

        <PasswordField
          label="Confirmar contraseña"
          placeholder="Repita su contraseña"
          value={confirmar}
          onChangeText={(t) => { setConfirmar(t); setErrores({ ...errores, confirmar: "" }); }}
          error={errores.confirmar}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={enviar}
        />

        {/* Términos y condiciones */}
        <View style={estilos.terminosContenedor}>
          <TouchableOpacity
            style={[estilos.checkbox, aceptaTerminos && estilos.checkboxActivo]}
            onPress={() => {
              setAceptaTerminos(!aceptaTerminos);
              setErrores({ ...errores, terminos: "" });
            }}
            activeOpacity={0.8}
          >
            {aceptaTerminos && <Text style={estilos.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={estilos.terminosTextoFila}>
            <Text style={estilos.terminosTexto}>He leído y acepto los </Text>
            <TouchableOpacity onPress={() => router.push("/terminos" as any)} activeOpacity={0.7}>
              <Text style={estilos.terminosEnlace}>Términos y Condiciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errores.terminos ? (
          <Text style={estilos.errorTerminos}>{errores.terminos}</Text>
        ) : null}

        <TouchableOpacity
          style={[estilos.boton, !aceptaTerminos && estilos.botonDeshabilitado]}
          onPress={enviar}
          activeOpacity={0.85}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={estilos.textoBoton}>Registrarse</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={estilos.enlaceContenedor} onPress={() => router.replace("/login")}>
          <Text style={estilos.enlace}>¿Ya tiene una cuenta?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll:     { padding: 24, paddingTop: 48, paddingBottom: 40 },
  imagen:     { width: 100, height: 100, alignSelf: "center", marginBottom: 24, resizeMode: "contain" },
  titulo:     { fontSize: 28, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, textAlign: "center" },
  subtitulo:  { fontSize: 15, color: "#666666", marginBottom: 32, textAlign: "center" },

  terminosContenedor: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 4 },
  checkbox:           { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#D0D0D0", backgroundColor: "#F8F9FA", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 },
  checkboxActivo:     { borderColor: "#2C3E50", backgroundColor: "#2C3E50" },
  checkmark:          { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  terminosTextoFila:  { flexDirection: "row", alignItems: "center", flexWrap: "wrap", flex: 1 },
  terminosTexto:      { fontSize: 14, color: "#444444" },
  terminosEnlace:     { fontSize: 14, color: "#3498db", fontWeight: "600", textDecorationLine: "underline" },
  errorTerminos:      { fontSize: 12, color: "#e74c3c", marginBottom: 8, marginLeft: 34 },

  boton:              { marginTop: 12, height: 52, backgroundColor: "#2C3E50", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  botonDeshabilitado: { backgroundColor: "#95a5a6" },
  textoBoton:         { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  enlaceContenedor:   { marginTop: 20, alignItems: "center" },
  enlace:             { fontSize: 14, color: "#3498db", fontWeight: "600" },
});