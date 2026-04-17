import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo invalido';
    if (!password) newErrors.password = 'La contrasena es requerida';
    else if (password.length < 6) newErrors.password = 'Minimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <View style={styles.logoMark} />
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electronico</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#BBBBBB"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contrasena</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#BBBBBB"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
          <Text style={styles.forgotText}>¿Olvidaste tu contrasena?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.buttonText}>Iniciar sesion</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLink}>Registrate</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoMark: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#2C3E50', alignSelf: 'center', marginBottom: 28,
  },
  title: {
    fontSize: 26, fontWeight: '700', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 14, color: '#888888',
    textAlign: 'center', marginBottom: 36,
  },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 13, color: '#444444',
    marginBottom: 6, fontWeight: '500',
  },
  input: {
    borderWidth: 1.5, borderColor: '#DDDDDD', borderRadius: 10,
    backgroundColor: '#F9F9F9', color: '#1A1A1A',
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
  },
  inputError: { borderColor: '#E74C3C' },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#2C3E50', fontSize: 13, fontWeight: '500' },
  button: {
    backgroundColor: '#2C3E50', borderRadius: 10, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 28,
  },
  footerText: { color: '#888888', fontSize: 14 },
  footerLink: { color: '#2C3E50', fontSize: 14, fontWeight: '600' },
});