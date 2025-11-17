import { Platform } from 'react-native';

/**
 * Paleta de colores principal de la aplicación
 * Inspirada en los colores corporativos de Falabella
 * 
 * Estos colores se usan consistentemente en toda la aplicación
 * para mantener una identidad visual coherente
 */
export const FalabellaColors = {
  // Colores principales de la marca
  primary: '#00A650',     // Verde Falabella - Color principal de la marca
  secondary: '#FFB800',   // Amarillo/Dorado - Color secundario para acentos
  
  // Colores de fondo
  background: '#FFFFFF',      // Fondo principal blanco
  backgroundGray: '#F5F5F5',  // Fondo gris claro para secciones alternativas
  
  // Colores de texto
  text: '#333333',        // Texto principal oscuro
  textLight: '#666666',   // Texto secundario gris medio
  textMuted: '#999999',   // Texto deshabilitado o menos importante
  
  // Colores de interfaz
  border: '#E0E0E0',      // Bordes y divisores
  
  // Colores de estado
  error: '#E53935',       // Rojo para errores y alertas
  success: '#00A650',     // Verde para éxito (mismo que primary)
  warning: '#FFB800',     // Amarillo para advertencias (mismo que secondary)
  
  // Colores básicos
  black: '#000000',       // Negro puro
  white: '#FFFFFF',       // Blanco puro
  
  // Efectos visuales
  cardShadow: 'rgba(0, 0, 0, 0.08)',  // Sombra sutil para tarjetas
}

/**
 * Configuración de colores para modo claro y oscuro
 * 
 * Define los colores que cambian según el tema del sistema
 * Actualmente la app usa principalmente el modo claro
 */
export const Colors = {
  // Tema claro (modo principal de la app)
  light: {
    text: FalabellaColors.text,                    // Texto principal
    background: FalabellaColors.background,        // Fondo principal
    tint: FalabellaColors.primary,                 // Color de acento
    icon: FalabellaColors.textLight,               // Iconos normales
    tabIconDefault: FalabellaColors.textMuted,     // Iconos de tabs inactivos
    tabIconSelected: FalabellaColors.primary,      // Iconos de tabs activos
  },
  
  // Tema oscuro (preparado para futuras implementaciones)
  dark: {
    text: '#ECEDEE',                               // Texto claro para fondo oscuro
    background: '#151718',                         // Fondo oscuro
    tint: FalabellaColors.primary,                 // Mantiene el verde de la marca
    icon: '#9BA1A6',                               // Iconos en gris claro
    tabIconDefault: '#9BA1A6',                     // Tabs inactivos en gris
    tabIconSelected: FalabellaColors.primary,      // Tabs activos mantienen el verde
  },
};

/**
 * Configuración de fuentes por plataforma
 * 
 * Define las familias de fuentes que se usan en cada plataforma
 * para mantener consistencia visual y aprovechar las fuentes nativas
 */
export const Fonts = Platform.select({
  // Fuentes para iOS - Usa las fuentes del sistema iOS
  ios: {
    /** Fuente sans-serif del sistema iOS */
    sans: 'system-ui',
    /** Fuente serif del sistema iOS */
    serif: 'ui-serif',
    /** Fuente redondeada del sistema iOS */
    rounded: 'ui-rounded',
    /** Fuente monoespaciada del sistema iOS */
    mono: 'ui-monospace',
  },
  
  // Fuentes por defecto para Android y otras plataformas
  default: {
    sans: 'normal',      // Fuente sans-serif estándar
    serif: 'serif',      // Fuente serif estándar
    rounded: 'normal',   // Fallback a fuente normal
    mono: 'monospace',   // Fuente monoespaciada estándar
  },
  
  // Fuentes para Web - Stack completo de fuentes web
  web: {
    // Stack de fuentes sans-serif optimizado para web
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    // Stack de fuentes serif para web
    serif: "Georgia, 'Times New Roman', serif",
    // Stack de fuentes redondeadas para web
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    // Stack de fuentes monoespaciadas para web
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
