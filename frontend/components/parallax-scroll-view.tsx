/**
 * Componente ParallaxScrollView
 * 
 * Crea un efecto de parallax donde la imagen del header se mueve
 * a diferente velocidad que el contenido al hacer scroll.
 * 
 * Características:
 * - Header con imagen que hace parallax
 * - Soporte para tema claro/oscuro
 * - Animaciones suaves con Reanimated
 * - Escalado dinámico de la imagen
 */

import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

// Altura fija del header en píxeles
const HEADER_HEIGHT = 250;

/**
 * Props del componente ParallaxScrollView
 */
type Props = PropsWithChildren<{
  headerImage: ReactElement;                                    // Imagen que se mostrará en el header
  headerBackgroundColor: { dark: string; light: string };      // Colores de fondo para tema claro/oscuro
}>;

/**
 * Componente principal que renderiza el scroll view con efecto parallax
 */
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  // Obtener color de fondo según el tema actual
  const backgroundColor = useThemeColor({}, 'background');
  
  // Detectar si estamos en modo claro u oscuro
  const colorScheme = useColorScheme() ?? 'light';
  
  // Referencia animada al ScrollView para tracking del scroll
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  
  // Hook que trackea la posición del scroll en tiempo real
  const scrollOffset = useScrollOffset(scrollRef);
  
  // Estilo animado que se aplica al header basado en la posición del scroll
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Efecto parallax: el header se mueve más lento que el contenido
          translateY: interpolate(
            scrollOffset.value,                                    // Valor actual del scroll
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],                   // Rango de entrada
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]        // Rango de salida (movimiento más lento)
          ),
        },
        {
          // Efecto de escala: la imagen se agranda cuando se hace scroll hacia arriba
          scale: interpolate(
            scrollOffset.value,                                    // Valor actual del scroll
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],                   // Rango de entrada
            [2, 1, 1]                                             // Escala: 2x cuando scroll negativo, 1x normal
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}  // Optimización: limita eventos de scroll a 60fps
    >
      {/* Header animado con imagen de parallax */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },  // Color según tema
          headerAnimatedStyle,                                      // Aplicar animaciones
        ]}
      >
        {headerImage}
      </Animated.View>
      
      {/* Contenido principal que se desplaza normalmente */}
      <ThemedView style={styles.content}>
        {children}
      </ThemedView>
    </Animated.ScrollView>
  );
}

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Estilo del header que contiene la imagen
  header: {
    height: HEADER_HEIGHT,     // Altura fija del header
    overflow: 'hidden',        // Ocultar contenido que se salga del área
  },
  
  // Estilo del área de contenido principal
  content: {
    flex: 1,                   // Ocupar todo el espacio disponible
    padding: 32,               // Espaciado interno
    gap: 16,                   // Espacio entre elementos hijos
    overflow: 'hidden',        // Ocultar contenido desbordante
  },
});
