import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TerminosScreen() {
  const router = useRouter();

  return (
    <View style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={estilos.botonVolver}>
          <Text style={estilos.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Términos y Condiciones</Text>
        <Text style={estilos.headerSubtitulo}>Quemepongo — Armario Inteligente</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        <Text style={estilos.fechaActualizacion}>Última actualización: junio 2026</Text>
        <Text style={estilos.intro}>
          Bienvenido a Quemepongo. Antes de usar nuestra aplicación, lee detenidamente estos
          Términos y Condiciones. Al crear una cuenta y utilizar el servicio, confirmas que los
          has leído, comprendido y aceptado en su totalidad.
        </Text>

        <Text style={estilos.seccionTitulo}>1. Descripción del servicio</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo es una aplicación de armario inteligente que permite a los usuarios gestionar
          su ropa y outfits de forma digital. El servicio incluye funcionalidades de registro e
          inicio de sesión de usuarios, gestión del armario personal, y consulta de información
          climática mediante una API externa para sugerir combinaciones de ropa según el clima
          del día.
        </Text>

        <Text style={estilos.seccionTitulo}>2. Registro y cuenta de usuario</Text>
        <Text style={estilos.seccionTexto}>
          Para acceder al servicio debes crear una cuenta proporcionando un nombre de usuario,
          correo electrónico y contraseña. Eres responsable de mantener la confidencialidad de
          tus credenciales de acceso. Quemepongo no se hace responsable de pérdidas ocasionadas
          por el uso no autorizado de tu cuenta. Debes notificar inmediatamente cualquier acceso
          no autorizado a tu cuenta.{"\n\n"}
          La contraseña debe cumplir con requisitos mínimos de seguridad: al menos 8 caracteres,
          una letra mayúscula, una minúscula, un número y un carácter especial.
        </Text>

        <Text style={estilos.seccionTitulo}>3. Uso aceptable</Text>
        <Text style={estilos.seccionTexto}>
          Al usar Quemepongo te comprometes a:{"\n\n"}
          • No utilizar el servicio para fines ilegales o no autorizados.{"\n"}
          • No intentar acceder a cuentas de otros usuarios.{"\n"}
          • No interferir con el funcionamiento normal de la aplicación.{"\n"}
          • No subir contenido ofensivo, difamatorio o que infrinja derechos de terceros.{"\n"}
          • No realizar ingeniería inversa ni intentar extraer el código fuente de la aplicación.
        </Text>

        <Text style={estilos.seccionTitulo}>4. Datos personales y privacidad</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo recopila únicamente los datos necesarios para el funcionamiento del servicio:{"\n\n"}
          • Nombre de usuario{"\n"}
          • Correo electrónico{"\n"}
          • Contraseña (almacenada de forma encriptada){"\n"}
          • Información de prendas y outfits que el usuario ingrese voluntariamente{"\n\n"}
          No vendemos, alquilamos ni compartimos tu información personal con terceros con fines
          comerciales. Los datos pueden ser utilizados para mejorar el servicio y personalizar
          la experiencia del usuario. Tienes derecho a solicitar la eliminación de tu cuenta y
          datos en cualquier momento.
        </Text>

        <Text style={estilos.seccionTitulo}>5. API del clima</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo utiliza una API externa para obtener información climática. Esta información
          se usa exclusivamente para mejorar las sugerencias de outfits. No nos hacemos responsables
          de la exactitud o disponibilidad de los datos climáticos proporcionados por el servicio
          externo. La funcionalidad de sugerencias basadas en el clima puede verse afectada si
          el servicio externo no está disponible.
        </Text>

        <Text style={estilos.seccionTitulo}>6. Propiedad intelectual</Text>
        <Text style={estilos.seccionTexto}>
          Todo el contenido de Quemepongo, incluyendo diseño, código, logos y textos, es propiedad
          exclusiva del desarrollador. Queda prohibida su reproducción, distribución o modificación
          sin autorización expresa. El contenido que el usuario ingresa en la aplicación
          (prendas, outfits, etc.) es de su exclusiva propiedad.
        </Text>

        <Text style={estilos.seccionTitulo}>7. Disponibilidad del servicio</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo se reserva el derecho de interrumpir, modificar o discontinuar el servicio
          temporal o permanentemente, con o sin previo aviso. No nos hacemos responsables ante
          el usuario o terceros por cualquier modificación, suspensión o interrupción del servicio.
        </Text>

        <Text style={estilos.seccionTitulo}>8. Limitación de responsabilidad</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos
          responsables de:{"\n\n"}
          • Pérdida de datos por fallas técnicas.{"\n"}
          • Daños directos o indirectos derivados del uso o imposibilidad de uso del servicio.{"\n"}
          • Errores en las sugerencias de outfits o información climática.{"\n"}
          • Accesos no autorizados derivados de negligencia del usuario en el cuidado de sus credenciales.
        </Text>

        <Text style={estilos.seccionTitulo}>9. Cancelación de cuenta</Text>
        <Text style={estilos.seccionTexto}>
          Puedes solicitar la eliminación de tu cuenta en cualquier momento. Quemepongo se reserva
          el derecho de suspender o eliminar cuentas que infrinjan estos términos, sin previo aviso
          y sin responsabilidad alguna hacia el usuario afectado.
        </Text>

        <Text style={estilos.seccionTitulo}>10. Modificaciones a los términos</Text>
        <Text style={estilos.seccionTexto}>
          Quemepongo puede modificar estos Términos y Condiciones en cualquier momento. Los cambios
          serán notificados a través de la aplicación. El uso continuado del servicio tras la
          publicación de cambios constituye la aceptación de los nuevos términos.
        </Text>

        <Text style={estilos.seccionTitulo}>11. Legislación aplicable</Text>
        <Text style={estilos.seccionTexto}>
          Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa
          derivada del uso del servicio será resuelta conforme a la legislación chilena vigente,
          incluyendo la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 19.496
          sobre Protección de los Derechos de los Consumidores.
        </Text>

        <Text style={estilos.seccionTitulo}>12. Contacto</Text>
        <Text style={estilos.seccionTexto}>
          Si tienes dudas, consultas o solicitudes relacionadas con estos Términos y Condiciones
          o con el tratamiento de tus datos personales, puedes contactarnos a través de los
          canales oficiales disponibles en la aplicación.
        </Text>

        <TouchableOpacity style={estilos.botonAceptar} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={estilos.botonAceptarTexto}>Entendido, volver al registro</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFFFFF" },

  header:           { backgroundColor: "#2C3E50", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24 },
  botonVolver:      { marginBottom: 10 },
  botonVolverTexto: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  headerTitulo:     { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  headerSubtitulo:  { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "400" },

  scroll:             { padding: 24, paddingBottom: 48 },
  fechaActualizacion: { fontSize: 12, color: "#AAAAAA", marginBottom: 12 },
  intro:              { fontSize: 14, color: "#555555", lineHeight: 22, marginBottom: 20, fontStyle: "italic" },

  seccionTitulo: { fontSize: 15, fontWeight: "700", color: "#2C3E50", marginBottom: 8, marginTop: 24 },
  seccionTexto:  { fontSize: 14, color: "#555555", lineHeight: 22 },

  botonAceptar:      { marginTop: 40, height: 52, backgroundColor: "#2C3E50", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  botonAceptarTexto: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});