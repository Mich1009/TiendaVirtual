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
  'house': 'home-outlined',                                      // Inicio vacío
  'chevron.right': 'chevron-right',                             // Flecha derecha
  'chevron.left': 'chevron-left',                               // Flecha izquierda
  'chevron.down': 'expand-more',                                // Flecha abajo
  'chevron.up': 'expand-less',                                  // Flecha arriba
  
  // Iconos de acciones
  'paperplane.fill': 'send',                                    // Enviar
  'paperplane': 'send-outline',                                 // Enviar vacío
  'cart.fill': 'shopping-cart',                                 // Carrito de compras
  'plus': 'add',                                                // Agregar/Más
  'plus.circle': 'add-circle',                                  // Agregar círculo
  'minus': 'remove',                                            // Quitar/Menos
  'minus.circle': 'remove-circle',                              // Quitar círculo
  'xmark': 'close',                                             // Cerrar
  'xmark.circle': 'cancel',                                     // Cancelar círculo
  'checkmark': 'check',                                         // Comprobar
  'magnifyingglass': 'search',                                  // Buscar
  'xmark.circle.fill': 'cancel',                                // Cancelar círculo
  
  // Iconos de usuario
  'person.fill': 'person',                                      // Persona/Usuario
  'person': 'person-outline',                                   // Persona vacía
  'person.2.fill': 'people',                                    // Múltiples usuarios
  'person.2': 'people-outline',                                 // Múltiples vacías
  'person.crop.circle.fill': 'account-circle',                  // Avatar usuario
  'person.badge.key.fill': 'vpn-key',                           // Usuario con credenciales
  'lock.fill': 'lock',                                          // Candado/Cerrado
  'lock': 'lock-outline',                                       // Candado vacío
  'lock.open.fill': 'lock-open',                                // Abierto
  'lock.open': 'lock-open-outline',                             // Abierto vacío
  'key.fill': 'vpn-key',                                        // Llave
  
  // Iconos de productos
  'cube.box.fill': 'shopping-bag',                              // Caja/Producto
  'cube.box': 'shopping-bag',                                   // Caja vacía
  'tag.fill': 'local-offer',                                    // Etiqueta
  'tag': 'local-offer-outline',                                 // Etiqueta vacía
  'star.fill': 'star',                                          // Estrella llena
  'star': 'star-border',                                        // Estrella vacía
  'star.circle.fill': 'stars',                                  // Estrella círculo lleno
  'star.circle': 'star-outline',                                // Estrella círculo vacío
  
  // Iconos de categorías
  'folder.fill': 'folder',                                      // Carpeta llena
  'folder': 'folder-open',                                      // Carpeta abierta
  'folder.badge.plus': 'create-new-folder',                     // Carpeta con más
  'list.bullet.clipboard.fill': 'list',                         // Lista llena
  'list.bullet.clipboard': 'assignment',                        // Lista vacía
  'list.bullet': 'list',                                        // Lista viñetas
  
  // Iconos de edición
  'pencil': 'edit',                                             // Editar
  'pencil.fill': 'edit',                                        // Editar lleno
  'pencil.circle': 'edit',                                      // Editar círculo
  'pencil.circle.fill': 'edit',                                 // Editar círculo lleno
  'trash': 'delete',                                            // Eliminar
  'trash.fill': 'delete',                                       // Eliminar lleno
  'trash.circle': 'delete-outline',                             // Eliminar círculo
  'trash.circle.fill': 'delete',                                // Eliminar círculo lleno
  'photo': 'image',                                             // Foto
  'photo.fill': 'image',                                        // Foto llena
  'camera.fill': 'camera-alt',                                  // Cámara
  'camera': 'camera-outline',                                   // Cámara vacía
  'link': 'link',                                               // Enlace
  'link.circle': 'link',                                        // Enlace círculo
  
  // Iconos de estado
  'checkmark.circle.fill': 'check-circle',                      // Completado círculo
  'checkmark.circle': 'check-circle-outline',                   // Completado círculo vacío
  'checkmark.seal.fill': 'verified',                            // Verificado/Completado sello
  'checkmark.seal': 'verified-outline',                         // Verificado vacío
  'xmark.circle': 'cancel',                                     // Error círculo
  'xmark.circle.fill': 'cancel',                                // Error círculo lleno
  'exclamationmark.circle': 'warning',                          // Advertencia círculo
  'exclamationmark.circle.fill': 'error',                       // Error círculo lleno
  'exclamationmark.triangle': 'warning',                        // Advertencia triángulo
  'exclamationmark.triangle.fill': 'warning',                   // Advertencia triángulo llena
  'info.circle': 'info',                                        // Información círculo
  'info.circle.fill': 'info',                                   // Información círculo lleno
  'bell.fill': 'notifications-active',                          // Campana llena
  'bell': 'notifications',                                      // Campana
  'bell.circle': 'notifications',                               // Campana círculo
  'bell.circle.fill': 'notifications-active',                   // Campana círculo llena
  'clock.fill': 'access-time',                                  // Reloj lleno
  'clock': 'schedule',                                          // Reloj/Calendario
  'clock.circle': 'schedule',                                   // Reloj círculo
  'clock.circle.fill': 'access-time',                           // Reloj círculo lleno
  'questionmark.circle.fill': 'help',                           // Ayuda círculo
  'questionmark.circle': 'help-outline',                        // Ayuda círculo vacío
  'shippingbox.fill': 'local-shipping',                         // Caja de envío
  'shippingbox': 'local-shipping-outline',                      // Caja de envío vacía
  
  // Iconos de dinero/pago
  'dollarsign.circle.fill': 'paid',                             // Pago
  'dollarsign.circle': 'attach-money',                          // Dinero círculo
  'creditcard.fill': 'credit-card',                             // Tarjeta de crédito
  'creditcard': 'payment',                                      // Tarjeta vacía
  'wallet.pass.fill': 'account-balance-wallet',                 // Billetera
  'wallet.pass': 'wallet',                                      // Billetera vacía
  'cart': 'shopping-cart',                                      // Carrito vacío
  
  // Iconos de configuración
  'gear': 'settings',                                           // Configuración
  'gear.fill': 'settings',                                      // Configuración llena
  'ellipsis': 'more-horiz',                                     // Más opciones
  'ellipsis.circle': 'more-vert',                               // Más opciones círculo
  'ellipsis.circle.fill': 'more-vert',                          // Más opciones círculo lleno
  'sliders.horizontal': 'tune',                                 // Filtros/Controles
  'sliders.horizontal.circle': 'tune',                          // Filtros círculo
  
  // Iconos de comunicación
  'envelope.fill': 'mail',                                      // Correo lleno
  'envelope': 'mail-outline',                                   // Correo vacío
  'phone.fill': 'phone',                                        // Teléfono lleno
  'phone': 'phone-in-talk',                                     // Teléfono llamada
  'message.fill': 'message',                                    // Mensaje lleno
  'message': 'sms',                                             // Mensaje SMS
  'bubble.left.and.bubble.right.fill': 'forum',                // Chat lleno
  'bubble.left.and.bubble.right': 'chat',                       // Chat vacío
  
  // Iconos de descuento/ofertas
  'percent': 'percent',                                         // Porcentaje
  'heart.fill': 'favorite',                                     // Corazón lleno/Favorito
  'heart': 'favorite-border',                                   // Corazón vacío
  
  // Iconos técnicos
  'chevron.left.forwardslash.chevron.right': 'code',           // Código/Desarrollo
  'cloud': 'cloud',                                             // Nube
  'cloud.fill': 'cloud-upload',                                 // Nube llena
  'arrow.up': 'arrow-upward',                                   // Flecha arriba
  'arrow.down': 'arrow-downward',                               // Flecha abajo
  'arrow.left': 'arrow-back',                                   // Flecha izquierda
  'arrow.right': 'arrow-forward',                               // Flecha derecha
  
  // Iconos de viaje/envío
  'map.fill': 'map',                                            // Mapa lleno
  'map': 'location-on',                                         // Ubicación
  'map.circle': 'location-on',                                  // Mapa círculo
  'map.circle.fill': 'map',                                     // Mapa círculo lleno
  'truck.box.fill': 'local-shipping',                           // Envío/Camión
  'truck.box': 'local-shipping-outline',                        // Camión vacío
  'doc.fill': 'description',                                    // Documento lleno
  'doc': 'article',                                             // Artículo
  'doc.circle.fill': 'article',                                 // Documento círculo lleno
  'doc.circle': 'article-outline',                              // Documento círculo vacío
  
  // Iconos de vista
  'eye.fill': 'visibility',                                     // Ojo lleno/Visible
  'eye': 'visibility-off',                                      // Ojo cerrado/Invisible
  'eye.slash.fill': 'visibility-off',                           // Ojo tachado lleno
  'eye.slash': 'visibility-off',                                // Ojo tachado vacío
  'square.grid.2x2': 'grid-on',                                 // Cuadrícula
  'square.grid.2x2.fill': 'dashboard',                          // Dashboard/Cuadrícula llena
  'list.number': 'list-numbered',                               // Lista numerada
  'list.number.rtl': 'format-list-numbered-rtl',                // Lista RTL
  'person.circle': 'account-circle',                            // Círculo persona
  'person.circle.fill': 'account-circle',                       // Círculo persona lleno
  
  // Iconos adicionales útiles
  'arrow.uturn.left': 'undo',                                   // Deshacer
  'arrow.uturn.left.circle.fill': 'undo',                       // Deshacer círculo
  'arrow.clockwise': 'refresh',                                 // Actualizar
  'arrow.clockwise.circle.fill': 'sync',                        // Actualizar círculo
  'arrow.triangle.2.circlepath': 'sync',                        // Sincronizar
  'arrow.triangle.2.circlepath.circle.fill': 'sync',            // Sincronizar círculo
  'square.and.arrow.up': 'share',                               // Compartir
  'square.and.arrow.up.fill': 'share',                          // Compartir lleno
  'bookmark.fill': 'bookmark',                                  // Marcador lleno
  'bookmark': 'bookmark-border',                                // Marcador vacío
  'flag.fill': 'flag',                                          // Bandera llena
  'flag': 'flag-outline',                                       // Bandera vacía
  'building.2.fill': 'business',                                // Negocio
  'building.2': 'storefront',                                   // Tienda vacía
  'location.fill': 'location-on',                               // Ubicación llena
  'location': 'location-on-outline',                            // Ubicación vacía
  'phone.fill': 'phone',                                        // Teléfono lleno (duplicado)
  'gearshape.fill': 'settings',                                 // Engranaje/Configuración
  'gearshape': 'settings-backup-restore',                       // Engranaje vacío
  'paintbrush.fill': 'palette',                                 // Paleta de colores
  'paintbrush': 'brush',                                        // Pincel
  'paintbrush.circle': 'palette',                               // Paleta círculo
  'paintbrush.circle.fill': 'palette',                          // Paleta círculo lleno
  'plus.circle.fill': 'add-circle',                             // Agregar círculo
  'plus.circle': 'add-circle-outline',                          // Agregar círculo vacío
  'minus.circle.fill': 'remove-circle',                         // Quitar círculo
  'minus.circle': 'remove-circle-outline',                      // Quitar círculo vacío
  'person.2': 'people',                                         // Múltiples personas
  'person.2.fill': 'people',                                    // Múltiples personas lleno
  'bag': 'shopping-bag',                                        // Bolsa
  'bag.fill': 'shopping-bag',                                   // Bolsa llena
  'calendar': 'event',                                          // Calendario
  'calendar.circle.fill': 'event-available',                    // Calendario lleno
  'photo': 'image',                                             // Foto
  'photo.fill': 'image',                                        // Foto llena
  'chart.bar.fill': 'bar-chart',                                // Gráfica de barras
  'chart.bar': 'trending-up',                                   // Gráfica vacía
  'rectangle.portrait.and.arrow.right': 'logout',               // Logout/Salir
  'rectangle.portrait.and.arrow.right.fill': 'logout',          // Logout lleno
  'photo.badge.plus': 'add-a-photo',                            // Agregar foto
  
  // Iconos adicionales variantes que podrían usarse
  'star.circle.fill': 'star-rate',                              // Estrella círculo lleno
  'star.circle': 'star-outline',                                // Estrella círculo vacío
  'heart.circle.fill': 'favorite',                              // Corazón círculo lleno
  'heart.circle': 'favorite-border',                            // Corazón círculo vacío
  'arrow.uturn.right': 'redo',                                  // Rehacer
  'arrow.uturn.right.circle.fill': 'redo',                      // Rehacer círculo
  'doc.text.fill': 'article',                                   // Documento texto lleno
  'doc.text': 'article-outline',                                // Documento texto vacío
  'folder.circle.fill': 'folder-special',                       // Carpeta círculo lleno
  'folder.circle': 'folder-open',                               // Carpeta círculo vacío
  'square.fill': 'square',                                      // Cuadrado lleno
  'square': 'check-box-outline-blank',                          // Cuadrado vacío
  'circle.fill': 'radio-button-checked',                        // Círculo lleno
  'circle': 'radio-button-unchecked',                           // Círculo vacío
  'checkmark.circle': 'check-circle-outline',                   // Comprobar círculo vacío
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
