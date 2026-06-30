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
} from "react-native";
import { FormField } from "@/components/form-field";
import { PasswordField } from "@/components/password-field";
import { saveToken } from "@/services/authService";
import { AUTH_API_URL } from "@/services/apiConfig";

const logo = require("../assets/images/icon.png");

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    console.log('=== INICIANDO LOGIN ===');
    console.log('Correo:', correo);
    console.log('AUTH_API_URL:', AUTH_API_URL);
    console.log('URL completa:', `${AUTH_API_URL}/auth/login`);

    if (!correo || !contrasena) {
      Alert.alert("Campos incompletos", "Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const url = `${AUTH_API_URL}/auth/login`;
      console.log('Haciendo fetch a:', url);

      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: correo.trim(),
          password: contrasena,
        }),
      });

      console.log('Respuesta status:', respuesta.status);
      console.log('Respuesta ok:', respuesta.ok);

      if (respuesta.ok) {
        // Si el login es exitoso, leemos la respuesta para obtener el token.
        const datos = await respuesta.json();
        console.log('Datos de respuesta:', datos);
        await saveToken(datos.token);
        router.replace('/main-menu');
      } else {
        // Si hay un error, leemos el mensaje de error.
        const errorData = await respuesta.json();
        console.error('Error de login - Status:', respuesta.status);
        console.error('Error de login - Data:', errorData);
        Alert.alert('Error de inicio de sesión', errorData.message || 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor o la respuesta fue inválida.');
    } finally {
      setCargando(false);
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

        <Text style={estilos.titulo}>Bienvenido de vuelta</Text>
        <Text style={estilos.subtitulo}>Ingresa a tu armario inteligente</Text>

        <FormField
          label="Correo electrónico"
          placeholder="tu.correo@ejemplo.com"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <PasswordField
          label="Contraseña"
          placeholder="Tu contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={estilos.boton}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBoton}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.enlaceContenedor}
          onPress={() => router.push("/registro")}
        >
          <Text style={estilos.enlace}>¿No tienes una cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 40, justifyContent: 'center', flexGrow: 1 },
  imagen: { width: 120, height: 120, alignSelf: "center", marginBottom: 32, resizeMode: "contain" },
  titulo: { fontSize: 28, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, textAlign: "center" },
  subtitulo: { fontSize: 15, color: "#666666", marginBottom: 40, textAlign: "center" },
  boton: {
    marginTop: 20,
    height: 52,
    backgroundColor: "#3498db",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBoton: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  enlaceContenedor: { marginTop: 24, alignItems: "center" },
  enlace: { fontSize: 14, color: "#3498db", fontWeight: "600" },
});