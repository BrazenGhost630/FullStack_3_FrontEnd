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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FormField } from "@/components/form-field";
import { PasswordField } from "@/components/password-field";

const logo = require("../../assets/images/icon.png");

// Es una mejor práctica usar variables de entorno para las URLs de la API.
// Crea un archivo .env y añade: EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:8080/api" : "http://10.0.2.2:8080/api");
const URL_REGISTRO = `${API_BASE_URL}/auth/register`;

// Definir constantes fuera del componente para evitar que se re-creen en cada render.
const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,64}$/;
 
export default function Registro() {
  const router = useRouter();
  const [nombres, setNombres] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errores, setErrores] = useState({
    nombres: "",
    correo: "",
    contrasena: "",
    confirmar: "",
  });
  const [cargando, setCargando] = useState(false);

  function validar() {
    let nuevosErrores = {
      nombres: "",
      correo: "",
      contrasena: "",
      confirmar: "",
    };
    let valido = true;

    if (!nombres.trim()) {
      nuevosErrores.nombres = "El nombre de usuario es obligatorio.";
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
    } else if (!REGEX_CONTRASENA.test(contrasena)) {
      nuevosErrores.contrasena =
        "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
      valido = false;
    }

    if (!confirmar) {
      nuevosErrores.confirmar = "Confirma tu contraseña.";
      valido = false;
    } else if (contrasena !== confirmar) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden.";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  }

  async function enviar() {
    if (!validar()) return;

    setCargando(true);
    try {
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

      const datos = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert(
          "¡Registro exitoso!",
          `Bienvenido, ${nombres.trim()}. Serás redirigido para iniciar sesión.`,
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
      } else {
        Alert.alert(
          "Error",
          datos.message || "No se pudo completar el registro.",
        );
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
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

        <Text style={estilos.titulo}>Crear cuenta</Text>
        <Text style={estilos.subtitulo}>
          Completa los datos para registrarte
        </Text>

        <FormField
          label="Nombre de usuario"
          placeholder="Ingrese su nombre"
          value={nombres}
          onChangeText={(texto) => {
            setNombres(texto);
            setErrores({ ...errores, nombres: "" });
          }}
          error={errores.nombres}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <FormField
          label="Correo electrónico"
          placeholder="Ingrese su correo"
          value={correo}
          onChangeText={(texto) => {
            setCorreo(texto);
            setErrores({ ...errores, correo: "" });
          }}
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
          onChangeText={(texto) => {
            setContrasena(texto);
            setErrores({ ...errores, contrasena: "" });
          }}
          error={errores.contrasena}
          autoCapitalize="none"
          returnKeyType="next"
        />

        <PasswordField
          label="Confirmar contraseña"
          placeholder="Repita su contraseña"
          value={confirmar}
          onChangeText={(texto) => {
            setConfirmar(texto);
            setErrores({ ...errores, confirmar: "" });
          }}
          error={errores.confirmar}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={enviar}
        />

        <TouchableOpacity
          style={estilos.boton}
          onPress={enviar}
          activeOpacity={0.85}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBoton}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={estilos.enlaceContenedor} onPress={() => router.replace('/login')}>
          <Text style={estilos.enlace}>¿Ya tiene una cuenta?</Text>
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
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 32,
    textAlign: "center",
  },
  boton: {
    marginTop: 12,
    height: 52,
    backgroundColor: "#2C3E50",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  enlaceContenedor: { marginTop: 20, alignItems: "center" },
  enlace: { fontSize: 14, color: "#2C3E50", fontWeight: "600" },
});
