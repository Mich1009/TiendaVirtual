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
// Permitimos pasar tanto claves SF Symbols (las del MAPPING) como nombres
// directos de Material Icons (por compatibilidad con usos existentes).
type IconSymbolName = keyof typeof MAPPING | string;

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
  // Navegación y layout
  'house.fill': 'home',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',

  // Acciones comunes
  'magnifyingglass': 'search',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'pencil': 'edit',
  'trash': 'delete',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',

  // Carrito / e-commerce
  'cart.fill': 'shopping-cart',
  'cart': 'shopping-cart',
  'bag': 'shopping_bag',
  'cube.box.fill': 'inventory',
  'cube.box': 'inventory',
  'shippingbox.fill': 'local_shipping',

  // Usuario / perfiles
  'person.fill': 'person',
  'person.2': 'group',
  'person.2.fill': 'group',
  // 'admin_panel_settings' caused warnings on some platforms; use a safe fallback
  'person.badge.key.fill': 'admin-panel-settings',

  // Formularios / UI
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'creditcard.fill': 'credit_card',
  'phone.fill': 'phone',
  'location.fill': 'location-on',
  'calendar': 'event',

  // Multimedia / imágenes
  'photo': 'photo',
  // map to a widely-supported Material icon name
  'photo.badge.plus': 'photo-camera',
  'folder': 'folder',
  'folder.fill': 'folder',
  'folder.badge.plus': 'create',

  // Indicadores / status
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.circle.fill': 'error',
  'dollarsign.circle.fill': 'monetization-on',

  // Herramientas / settings
  'paintbrush.fill': 'brush',
  'gearshape.fill': 'settings',
  'storefront': 'storefront',
  // Ojos / visibilidad
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  // Persona circular (perfil)
  'person.circle': 'account-circle',
  // Rayo/energía
  'bolt': 'flash_on',

  // Misc
  'rectangle.portrait.and.arrow.right': 'logout',
  'list.bullet.clipboard.fill': 'assignment',
  'list.bullet.clipboard': 'assignment',
  'chevron.left.forwardslash.chevron.right': 'code',
  // Backwards-compatible aliases / catch-alls for names that appeared in warnings
  'admin_panel_settings': 'settings',
  'add_a_photo': 'photo-camera',
  'attach_money': 'monetization-on',
  'text_fields': 'title',
  'chart.bar.fill': 'assessment',
  // aliases for chart callers that used other names
  'insert_chart': 'assessment',
  'bar_chart': 'assessment',
  'show_chart': 'assessment',
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
  // Acepta una clave SF (que existe en MAPPING) o el nombre directo de Material Icon.
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Si el `name` coincide con una clave de MAPPING, usamos el valor mapeado.
  // Si no, asumimos que el consumidor pasó un nombre válido de Material Icons
  // y lo usamos tal cual. En cualquier caso aplicamos un fallback final.
  const mapped = (MAPPING as Record<string, string>)[name as string]
  const resolved = mapped || (name as string)
  const iconName = resolved || 'help-outline'
  return <MaterialIcons color={color} size={size} name={iconName as any} style={style} />;
}
