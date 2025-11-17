/**
 * Hook para obtener colores según el tema actual (claro/oscuro)
 * 
 * Este hook permite obtener colores que se adapten automáticamente
 * al tema del sistema o al tema configurado por el usuario.
 * 
 * Más información sobre temas:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Hook que devuelve un color basado en el tema actual
 * 
 * @param props - Colores específicos para cada tema (opcional)
 * @param props.light - Color para tema claro
 * @param props.dark - Color para tema oscuro
 * @param colorName - Nombre del color en la paleta de Colors
 * 
 * @returns Color string apropiado para el tema actual
 * 
 * @example
 * // Usar color de la paleta según el tema
 * const backgroundColor = useThemeColor({}, 'background')
 * 
 * @example
 * // Usar colores personalizados según el tema
 * const customColor = useThemeColor(
 *   { light: '#ffffff', dark: '#000000' }, 
 *   'background'
 * )
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Obtener el tema actual (claro u oscuro)
  const theme = useColorScheme() ?? 'light';
  
  // Buscar color personalizado para el tema actual
  const colorFromProps = props[theme];

  if (colorFromProps) {
    // Si hay color personalizado, usarlo
    return colorFromProps;
  } else {
    // Si no hay color personalizado, usar el de la paleta
    return Colors[theme][colorName];
  }
}
