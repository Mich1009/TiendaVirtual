/**
 * Componente de Iconos Multiplataforma
 * 
 * Este componente proporciona iconos consistentes en todas las plataformas:
 * - iOS: Usa SF Symbols nativos (cuando está disponible)
 * - Android/Web: Usa Material Icons como fallback
 * 
 * Los nombres de iconos están basados en SF Symbols y se mapean
 * manualmente a Material Icons para mantener consistencia visual.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Tipo que mapea nombres de SF Symbols a nombres de Material Icons
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

// Tipo que define los nombres de iconos disponibles
type IconSymbolName = keyof typeof MAPPING;

/**
 * Mapeo de iconos SF Symbols a Material Icons
 * 
 * Agrega aquí los mapeos de SF Symbols a Material Icons.
 * - Ver Material Icons en: https://icons.expo.fyi
 * - Ver SF Symbols en la app SF Symbols de Apple
 * 
 * Formato: 'nombre-sf-symbol': 'nombre-material-icon'
 */
const MAPPING = {
  // Iconos de navegación
  'house.fill': 'home',                                          // Inicio/Home
  'chevron.right': 'chevron-right',                             // Flecha derecha
  
  // Iconos de acciones
  'paperplane.fill': 'send',                                    // Enviar
  'cart.fill': 'shopping-cart',                                 // Carrito de compras
  
  // Iconos de usuario
  'person.fill': 'person',                                      // Persona/Usuario
  
  // Iconos técnicos
  'chevron.left.forwardslash.chevron.right': 'code',           // Código/Desarrollo
} as IconMapping;

/**
 * Componente de icono que usa SF Symbols nativos en iOS y Material Icons en Android/Web
 * 
 * Esto asegura:
 * - Apariencia consistente en todas las plataformas
 * - Uso óptimo de recursos nativos
 * - Iconos que se ven naturales en cada plataforma
 * 
 * Los nombres están basados en SF Symbols y requieren mapeo manual a Material Icons.
 * 
 * @param name - Nombre del icono (basado en SF Symbols)
 * @param size - Tamaño del icono en píxeles (default: 24)
 * @param color - Color del icono
 * @param style - Estilos adicionales de texto
 * @param weight - Peso del símbolo (solo para SF Symbols en iOS)
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;                    // Nombre del icono del mapeo
  size?: number;                           // Tamaño opcional (default: 24px)
  color: string | OpaqueColorValue;        // Color requerido
  style?: StyleProp<TextStyle>;            // Estilos opcionales
  weight?: SymbolWeight;                   // Peso del símbolo (iOS únicamente)
}) {
  // En esta implementación siempre usa Material Icons
  // En iOS se podría usar expo-symbols condicionalmente
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
